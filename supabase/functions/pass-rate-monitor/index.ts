// Pass Rate Monitor — runs every 15 minutes via pg_cron
// Alerts when pass rate drops below configured thresholds

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WARNING_THRESHOLD = 80 // percent
const CRITICAL_THRESHOLD = 60 // percent

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: orgs } = await supabase.from('organizations').select('id')
    if (!orgs) return new Response(JSON.stringify({ message: 'No organizations' }), { status: 200 })

    let alertsCreated = 0
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    for (const org of orgs) {
      // Get test runs from last 24 hours
      const { data: runs } = await supabase
        .from('test_runs')
        .select('status, total_tests, passed, failed')
        .eq('organization_id', org.id)
        .gte('started_at', twentyFourHoursAgo)
        .in('status', ['passed', 'failed'])

      if (!runs?.length) continue

      const totalTests = runs.reduce((sum, r) => sum + r.total_tests, 0)
      const totalPassed = runs.reduce((sum, r) => sum + r.passed, 0)
      const passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 100

      // Determine severity
      let severity: 'critical' | 'warning' | null = null
      if (passRate < CRITICAL_THRESHOLD) {
        severity = 'critical'
      } else if (passRate < WARNING_THRESHOLD) {
        severity = 'warning'
      }

      if (!severity) continue

      // Check if we already have a recent alert for this
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('organization_id', org.id)
        .eq('type', 'pass_rate_drop')
        .gte('created_at', oneHourAgo)
        .limit(1)

      if (existing?.length) continue

      await supabase.from('alerts').insert({
        organization_id: org.id,
        type: 'pass_rate_drop',
        severity,
        title: `Pass rate dropped to ${passRate}% in the last 24 hours`,
        message: `${runs.length} test runs analyzed. ${totalPassed}/${totalTests} tests passed. Threshold: ${severity === 'critical' ? CRITICAL_THRESHOLD : WARNING_THRESHOLD}%.`,
      })
      alertsCreated++
    }

    return new Response(JSON.stringify({
      message: 'Pass rate check complete',
      alerts_created: alertsCreated,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
