// Crash Deduplication — triggered via database webhook on crashes insert
// When a new crash is reported, checks fingerprint against existing crashes
// If match found: increments occurrence_count, updates last_seen, adds device
// If new: leaves the new crash entry as-is

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    if (!record) {
      return new Response(JSON.stringify({ error: 'No record provided' }), { status: 400 })
    }

    const { id, organization_id, fingerprint, affected_devices, stack_trace } = record

    if (!fingerprint) {
      // Generate fingerprint from stack trace if not provided
      const generatedFingerprint = generateFingerprint(stack_trace || record.title)
      await supabase
        .from('crashes')
        .update({ fingerprint: generatedFingerprint })
        .eq('id', id)
      return new Response(JSON.stringify({ message: 'Fingerprint generated', fingerprint: generatedFingerprint }))
    }

    // Look for existing crash with same fingerprint in same org (excluding this one)
    const { data: existing } = await supabase
      .from('crashes')
      .select('id, occurrence_count, affected_devices, last_seen')
      .eq('organization_id', organization_id)
      .eq('fingerprint', fingerprint)
      .neq('id', id)
      .order('first_seen', { ascending: true })
      .limit(1)

    if (existing?.length) {
      const original = existing[0]
      const mergedDevices = Array.from(new Set([
        ...(original.affected_devices || []),
        ...(affected_devices || []),
      ]))

      // Update the original crash with new occurrence
      await supabase
        .from('crashes')
        .update({
          occurrence_count: original.occurrence_count + 1,
          last_seen: new Date().toISOString(),
          affected_devices: mergedDevices,
        })
        .eq('id', original.id)

      // Mark the new crash as duplicate
      await supabase
        .from('crashes')
        .update({ status: 'duplicate', metadata: { duplicate_of: original.id } })
        .eq('id', id)

      // Check if we should create a Jira ticket (3+ occurrences, no existing ticket)
      const { data: updated } = await supabase
        .from('crashes')
        .select('occurrence_count, jira_ticket, severity')
        .eq('id', original.id)
        .single()

      if (updated && updated.occurrence_count >= 3 && !updated.jira_ticket) {
        // Trigger Jira integration if configured
        // This would invoke the jira-integration function
      }

      return new Response(JSON.stringify({
        message: 'Duplicate crash merged',
        original_id: original.id,
        new_count: original.occurrence_count + 1,
        devices: mergedDevices.length,
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // New unique crash — check if it should trigger an alert
    if (['critical', 'high'].includes(record.severity)) {
      await supabase.from('alerts').insert({
        organization_id,
        type: 'new_crash',
        severity: record.severity === 'critical' ? 'critical' : 'warning',
        title: `New ${record.severity} crash: ${record.title}`,
        message: `Fingerprint: ${fingerprint}. First detected on ${affected_devices?.join(', ') || 'unknown device'}.`,
        related_entity_type: 'crash',
        related_entity_id: id,
      })
    }

    return new Response(JSON.stringify({
      message: 'New unique crash recorded',
      crash_id: id,
      fingerprint,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

function generateFingerprint(input: string): string {
  // Simple fingerprint: extract key identifiers from crash text
  const cleaned = input
    .replace(/0x[0-9a-fA-F]+/g, '0xXXXX') // normalize addresses
    .replace(/\d+/g, 'N') // normalize numbers
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim()
    .slice(0, 200)

  // Simple hash
  let hash = 0
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32-bit integer
  }
  return `crash_${Math.abs(hash).toString(36)}`
}
