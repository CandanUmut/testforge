// TestForge Ingestion Gateway
// ---------------------------------------------------------------------------
// The single authenticated write path for external clients (the reporter
// script, the lab agent, and CI jobs). It exists because raw PostgREST cannot
// authenticate an opaque `tf_` API key (RLS is auth.uid()-based) and because
// the friendly client payload does not match the internal table schema.
//
// This function:
//   1. Authenticates a `tf_` key against api_keys.key_hash (SHA-256).
//   2. Resolves organization_id from the key (clients can never spoof it).
//   3. Maps a stable public payload onto the real devices/test_runs/
//      test_results/crashes schema, using the service role to bypass RLS.
//
// Deploy with JWT verification disabled (see supabase/config.toml):
//   supabase functions deploy ingest --no-verify-jwt
//
// POST {SUPABASE_URL}/functions/v1/ingest
//   Authorization: Bearer tf_xxx        (or header: x-testforge-key: tf_xxx)
//   Body: { device?, run?, results?, crashes? }  (all sections optional)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-testforge-key, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// --- Schema mapping helpers ------------------------------------------------

const RUN_STATUSES = ['pending', 'running', 'passed', 'failed', 'error', 'cancelled', 'timeout']
const RESULT_STATUSES = ['passed', 'failed', 'error', 'skipped', 'flaky', 'timeout']

// Abuse / DoS guards. A single upload should never exceed these.
const MAX_BODY_BYTES = 2_000_000 // ~2 MB
const MAX_RESULTS = 5000
const MAX_CRASHES = 1000

function normalizeRunStatus(status: string | undefined): string {
  const s = (status || '').toLowerCase()
  if (s === 'completed' || s === 'success' || s === 'pass') return 'passed'
  if (s === 'fail') return 'failed'
  return RUN_STATUSES.includes(s) ? s : 'running'
}

function normalizeResultStatus(status: string | undefined): string {
  const s = (status || '').toLowerCase()
  return RESULT_STATUSES.includes(s) ? s : 'failed'
}

function inferCrashType(text: string): string {
  const t = (text || '').toLowerCase()
  if (t.includes('kernel panic') || t.includes('kernelpanic')) return 'kernel_panic'
  if (t.includes('anr') || t.includes('application not responding')) return 'anr'
  if (t.includes('segfault') || t.includes('segmentation fault') || t.includes('sigsegv')) return 'segfault'
  if (t.includes('watchdog')) return 'watchdog'
  if (t.includes('oom') || t.includes('out of memory')) return 'oom'
  if (t.includes('assert')) return 'assertion'
  if (t.includes('timeout')) return 'timeout'
  if (t.includes('power')) return 'power_failure'
  if (t.includes('java.') || t.includes('exception')) return 'java_exception'
  if (t.includes('panic') || t.includes('fault') || t.includes('sigabrt') || t.includes('sigbus')) return 'native_crash'
  return 'unknown'
}

function inferSeverity(crashType: string): string {
  if (['kernel_panic', 'segfault', 'power_failure'].includes(crashType)) return 'critical'
  if (['native_crash', 'watchdog', 'oom'].includes(crashType)) return 'high'
  return 'medium'
}

function durationToMs(run: Record<string, unknown>): number | null {
  if (typeof run.duration_ms === 'number') return Math.round(run.duration_ms as number)
  if (typeof run.duration === 'number') return Math.round((run.duration as number) * 1000)
  return null
}

// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // --- 1. Authenticate the API key ----------------------------------------
  const authHeader = req.headers.get('authorization') || ''
  const bearer = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : ''
  const apiKey = req.headers.get('x-testforge-key') || bearer

  if (!apiKey || !apiKey.startsWith('tf_')) {
    return json({ error: 'Missing or malformed API key. Provide a tf_ key via Authorization: Bearer.' }, 401)
  }

  const keyHash = await sha256Hex(apiKey)
  const { data: key } = await supabase
    .from('api_keys')
    .select('id, organization_id, permissions, is_active, expires_at')
    .eq('key_hash', keyHash)
    .maybeSingle()

  if (!key || !key.is_active) {
    return json({ error: 'Invalid or revoked API key.' }, 401)
  }
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return json({ error: 'API key has expired.' }, 401)
  }
  if (Array.isArray(key.permissions) && !key.permissions.includes('write')) {
    return json({ error: 'API key does not have write permission.' }, 403)
  }

  const orgId = key.organization_id
  // Fire-and-forget: record usage.
  supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', key.id)

  // --- 2. Parse payload (with a hard size cap) ----------------------------
  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: `Payload too large (max ${MAX_BODY_BYTES} bytes).` }, 413)
  }
  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw || '{}')
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return json({ error: 'Body must be a JSON object.' }, 400)
  }

  const now = new Date().toISOString()
  const summary = { device: false, run_id: null as string | null, results: 0, crashes: 0 }

  // Resolve (or upsert) a device by name within the org, return its id.
  // `extra` is cleaned of undefined values so defaults are never clobbered.
  async function resolveDeviceId(name?: string, extra: Record<string, unknown> = {}): Promise<string | null> {
    if (!name) return null
    const clean: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(extra)) if (v !== undefined) clean[k] = v

    const { data: existing } = await supabase
      .from('devices')
      .select('id')
      .eq('organization_id', orgId)
      .eq('name', name)
      .maybeSingle()
    if (existing) {
      await supabase.from('devices').update({ last_seen_at: now, ...clean }).eq('id', existing.id)
      return existing.id
    }
    const { data: created } = await supabase
      .from('devices')
      .insert({
        organization_id: orgId,
        name,
        device_type: 'custom',
        connection_type: 'agent',
        status: 'online',
        last_seen_at: now,
        ...clean,
      })
      .select('id')
      .single()
    return created?.id ?? null
  }

  try {
    // --- 3a. Device heartbeat ---------------------------------------------
    const device = body.device as Record<string, unknown> | undefined
    if (device?.name) {
      const battery = device.battery_level
      await resolveDeviceId(device.name as string, {
        status: (device.status as string) || 'online',
        firmware_version: device.firmware_version as string | undefined,
        device_type: device.device_type as string | undefined,
        connection_type: device.connection_type as string | undefined,
        last_seen_at: (device.last_heartbeat as string) || (device.last_seen_at as string) || now,
        ...(battery !== undefined ? { metadata: { battery_level: battery } } : {}),
      })
      summary.device = true
    }

    // --- 3b. Test run ------------------------------------------------------
    let runId: string | null = null
    const run = body.run as Record<string, unknown> | undefined
    if (run && (run.name || run.suite_name)) {
      const deviceId = await resolveDeviceId(run.device_name as string | undefined, {
        firmware_version: run.firmware_version as string | undefined,
      })
      const { data: createdRun, error: runErr } = await supabase
        .from('test_runs')
        .insert({
          organization_id: orgId,
          device_id: deviceId,
          name: (run.name as string) || (run.suite_name as string),
          suite_name: run.suite_name as string | undefined,
          trigger_type: (run.trigger_type as string) || 'api',
          status: normalizeRunStatus(run.status as string),
          total_tests: (run.total_tests as number) ?? 0,
          passed: (run.passed as number) ?? 0,
          failed: (run.failed as number) ?? 0,
          skipped: (run.skipped as number) ?? 0,
          error_count: (run.error_count as number) ?? 0,
          duration_ms: durationToMs(run),
          firmware_version: run.firmware_version as string | undefined,
          build_number: run.build_number as string | undefined,
          branch: run.branch as string | undefined,
          commit_sha: run.commit_sha as string | undefined,
          environment: (run.environment as string) || 'staging',
          started_at: (run.started_at as string) || now,
          completed_at: (run.completed_at as string) ?? null,
        })
        .select('id')
        .single()
      if (runErr) throw runErr
      runId = createdRun?.id ?? null
      summary.run_id = runId
    }

    // --- 3c. Test results --------------------------------------------------
    const results = body.results as Record<string, unknown>[] | undefined
    if (Array.isArray(results) && results.length) {
      if (!runId) return json({ error: 'results require a run section to attach to.' }, 400)
      if (results.length > MAX_RESULTS) return json({ error: `Too many results (max ${MAX_RESULTS}).` }, 413)
      const rows = results.map((r) => ({
        test_run_id: runId,
        organization_id: orgId,
        test_name: (r.test_name as string) || (r.name as string) || 'unknown',
        test_class: (r.test_class as string) || (r.classname as string) || null,
        status: normalizeResultStatus(r.status as string),
        duration_ms:
          typeof r.duration_ms === 'number' ? Math.round(r.duration_ms as number) : null,
        error_message: (r.error_message as string)?.slice(0, 4000) ?? null,
        stack_trace: (r.stack_trace as string)?.slice(0, 8000) ?? null,
      }))
      const { error: resErr } = await supabase.from('test_results').insert(rows)
      if (resErr) throw resErr
      summary.results = rows.length
    }

    // --- 3d. Crashes (with fingerprint-based dedup) ------------------------
    const crashes = body.crashes as Record<string, unknown>[] | undefined
    if (Array.isArray(crashes) && crashes.length) {
      if (crashes.length > MAX_CRASHES) return json({ error: `Too many crashes (max ${MAX_CRASHES}).` }, 413)
      for (const c of crashes) {
        const message = (c.error_message as string) || (c.title as string) || 'Unknown crash'
        const trace = (c.stack_trace as string) || ''
        const fingerprint =
          (c.fingerprint as string) || (await sha256Hex(message.split('\n')[0].slice(0, 200))).slice(0, 16)
        const crashType = (c.crash_type as string) || inferCrashType(message + ' ' + trace)
        const deviceId = await resolveDeviceId(c.device_name as string | undefined)

        // Dedup on (organization_id, fingerprint).
        const { data: existing } = await supabase
          .from('crashes')
          .select('id, occurrence_count')
          .eq('organization_id', orgId)
          .eq('fingerprint', fingerprint)
          .maybeSingle()

        if (existing) {
          await supabase
            .from('crashes')
            .update({
              occurrence_count: (existing.occurrence_count ?? 1) + 1,
              last_seen_at: (c.detected_at as string) || now,
            })
            .eq('id', existing.id)
        } else {
          await supabase.from('crashes').insert({
            organization_id: orgId,
            device_id: deviceId,
            test_run_id: runId,
            title: message.split('\n')[0].slice(0, 200),
            crash_type: crashType,
            severity: (c.severity as string) || inferSeverity(crashType),
            status: 'new',
            stack_trace: trace.slice(0, 8000) || null,
            log_snippet: message.slice(0, 2000),
            fingerprint,
            first_seen_at: (c.detected_at as string) || now,
            last_seen_at: (c.detected_at as string) || now,
            metadata: {
              test_name: c.test_name ?? null,
              firmware_version: c.firmware_version ?? null,
            },
          })
        }
        summary.crashes += 1
      }
    }

    return json({ ok: true, organization_id: orgId, ...summary })
  } catch (error) {
    return json({ ok: false, error: (error as Error).message ?? String(error) }, 500)
  }
})
