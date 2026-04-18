// Weekly Report Generator — runs every Monday at 6am UTC via pg_cron
// Generates a weekly summary for each organization

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: orgs } = await supabase.from('organizations').select('id, name, slug')
    if (!orgs) return new Response(JSON.stringify({ message: 'No organizations' }), { status: 200 })

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const reports = []

    for (const org of orgs) {
      // This week's runs
      const { data: thisWeekRuns } = await supabase
        .from('test_runs')
        .select('status, total_tests, passed, failed, duration_seconds')
        .eq('organization_id', org.id)
        .gte('started_at', sevenDaysAgo)

      // Last week's runs (for trend comparison)
      const { data: lastWeekRuns } = await supabase
        .from('test_runs')
        .select('status, total_tests, passed')
        .eq('organization_id', org.id)
        .gte('started_at', fourteenDaysAgo)
        .lt('started_at', sevenDaysAgo)

      // Active devices
      const { count: activeDevices } = await supabase
        .from('devices')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', org.id)
        .in('status', ['online', 'testing'])

      // New crashes this week
      const { data: newCrashes } = await supabase
        .from('crashes')
        .select('id, title, severity')
        .eq('organization_id', org.id)
        .gte('first_seen', sevenDaysAgo)

      // Resolved crashes this week
      const { data: resolvedCrashes } = await supabase
        .from('crashes')
        .select('id')
        .eq('organization_id', org.id)
        .gte('resolved_at', sevenDaysAgo)

      // Calculate metrics
      const totalRuns = thisWeekRuns?.length || 0
      const totalTests = thisWeekRuns?.reduce((s, r) => s + r.total_tests, 0) || 0
      const totalPassed = thisWeekRuns?.reduce((s, r) => s + r.passed, 0) || 0
      const passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0

      const lastWeekTests = lastWeekRuns?.reduce((s, r) => s + r.total_tests, 0) || 0
      const lastWeekPassed = lastWeekRuns?.reduce((s, r) => s + r.passed, 0) || 0
      const lastWeekPassRate = lastWeekTests > 0 ? Math.round((lastWeekPassed / lastWeekTests) * 100) : 0

      const totalDuration = thisWeekRuns?.reduce((s, r) => s + (r.duration_seconds || 0), 0) || 0

      const report = {
        organization_id: org.id,
        organization_name: org.name,
        period_start: sevenDaysAgo,
        period_end: new Date().toISOString(),
        metrics: {
          total_runs: totalRuns,
          total_tests: totalTests,
          pass_rate: passRate,
          pass_rate_trend: passRate - lastWeekPassRate,
          active_devices: activeDevices || 0,
          new_crashes: newCrashes?.length || 0,
          resolved_crashes: resolvedCrashes?.length || 0,
          total_test_duration_minutes: Math.round(totalDuration / 60),
          critical_crashes: newCrashes?.filter(c => c.severity === 'critical').length || 0,
        },
        generated_at: new Date().toISOString(),
      }

      reports.push(report)

      // Create a system alert with the summary
      await supabase.from('alerts').insert({
        organization_id: org.id,
        type: 'quota_warning', // Using as 'system' type
        severity: 'info',
        title: 'Weekly report generated',
        message: `Summary: ${totalRuns} test runs, ${passRate}% pass rate (${passRate > lastWeekPassRate ? '+' : ''}${passRate - lastWeekPassRate}% vs last week), ${newCrashes?.length || 0} new crashes, ${resolvedCrashes?.length || 0} resolved. ${activeDevices || 0} active devices.`,
        is_read: false,
      })
    }

    return new Response(JSON.stringify({
      message: 'Weekly reports generated',
      reports_count: reports.length,
      reports,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
