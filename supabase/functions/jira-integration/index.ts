// Jira Integration — auto-creates tickets for crashes with 3+ occurrences
// Triggered when crash_dedup detects a crash reaching the threshold
// Requires org-level Jira configuration in organization settings

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface JiraConfig {
  base_url: string      // e.g., "https://yourteam.atlassian.net"
  project_key: string   // e.g., "FWVAL"
  email: string         // Jira account email
  api_token: string     // Jira API token
}

interface CrashRecord {
  id: string
  organization_id: string
  title: string
  severity: string
  stack_trace: string | null
  ai_analysis: string | null
  occurrence_count: number
  affected_devices: string[] | null
  fingerprint: string | null
  first_seen: string
  last_seen: string
}

const SEVERITY_TO_PRIORITY: Record<string, string> = {
  critical: 'Highest',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const crashId = body.crash_id

    if (!crashId) {
      return new Response(JSON.stringify({ error: 'crash_id required' }), { status: 400 })
    }

    // Get the crash record
    const { data: crash, error: crashErr } = await supabase
      .from('crashes')
      .select('*')
      .eq('id', crashId)
      .single()

    if (crashErr || !crash) {
      return new Response(JSON.stringify({ error: 'Crash not found' }), { status: 404 })
    }

    const typedCrash = crash as CrashRecord

    // Skip if already has a Jira ticket
    if (typedCrash.jira_ticket) {
      return new Response(JSON.stringify({ message: 'Ticket already exists', ticket: typedCrash.jira_ticket }))
    }

    // Get org settings for Jira config
    const { data: org } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', typedCrash.organization_id)
      .single()

    const jiraConfig = org?.settings?.jira as JiraConfig | undefined
    if (!jiraConfig?.base_url || !jiraConfig?.api_token) {
      return new Response(JSON.stringify({ error: 'Jira not configured for this organization' }), { status: 400 })
    }

    // Build Jira ticket description
    const description = buildDescription(typedCrash)

    // Create Jira issue
    const jiraResponse = await fetch(`${jiraConfig.base_url}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${jiraConfig.email}:${jiraConfig.api_token}`)}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          project: { key: jiraConfig.project_key },
          summary: `[TestForge] ${typedCrash.title}`,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: description }],
              },
            ],
          },
          issuetype: { name: 'Bug' },
          priority: { name: SEVERITY_TO_PRIORITY[typedCrash.severity] || 'Medium' },
          labels: ['testforge', 'auto-triage', typedCrash.severity],
        },
      }),
    })

    if (!jiraResponse.ok) {
      const errBody = await jiraResponse.text()
      return new Response(JSON.stringify({ error: 'Jira API error', details: errBody }), { status: 500 })
    }

    const jiraIssue = await jiraResponse.json()
    const ticketKey = jiraIssue.key // e.g., "FWVAL-1892"

    // Update crash with Jira ticket
    await supabase
      .from('crashes')
      .update({ jira_ticket: ticketKey })
      .eq('id', typedCrash.id)

    // Create alert
    await supabase.from('alerts').insert({
      organization_id: typedCrash.organization_id,
      type: 'new_crash',
      severity: 'info',
      title: `Jira ticket ${ticketKey} auto-created`,
      message: `Automated ticket for crash "${typedCrash.title}" (${typedCrash.occurrence_count} occurrences). Assigned priority: ${SEVERITY_TO_PRIORITY[typedCrash.severity] || 'Medium'}.`,
      related_entity_type: 'crash',
      related_entity_id: typedCrash.id,
    })

    return new Response(JSON.stringify({
      message: 'Jira ticket created',
      ticket: ticketKey,
      url: `${jiraConfig.base_url}/browse/${ticketKey}`,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

function buildDescription(crash: CrashRecord): string {
  const parts = [
    `*Crash:* ${crash.title}`,
    `*Severity:* ${crash.severity}`,
    `*Occurrences:* ${crash.occurrence_count}`,
    `*First Seen:* ${crash.first_seen}`,
    `*Last Seen:* ${crash.last_seen}`,
    `*Fingerprint:* ${crash.fingerprint || 'N/A'}`,
    `*Affected Devices:* ${crash.affected_devices?.join(', ') || 'N/A'}`,
    '',
    '*Stack Trace:*',
    crash.stack_trace ? `{code}${crash.stack_trace}{code}` : 'No stack trace available',
  ]

  if (crash.ai_analysis) {
    parts.push('', '*AI Analysis:*', crash.ai_analysis)
  }

  parts.push('', '---', '_Auto-created by TestForge crash triage system_')

  return parts.join('\n')
}
