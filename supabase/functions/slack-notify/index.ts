// Slack Notification — sends alerts to org-configured webhook URL
// Triggered by: new critical crash, device offline, pass rate drop, weekly summary

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SlackConfig {
  webhook_url: string
  channel?: string
}

type NotificationType = 'crash' | 'device_offline' | 'pass_rate_drop' | 'weekly_summary'

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { organization_id, type, data } = body as {
      organization_id: string
      type: NotificationType
      data: Record<string, unknown>
    }

    if (!organization_id || !type) {
      return new Response(JSON.stringify({ error: 'organization_id and type required' }), { status: 400 })
    }

    // Get org Slack config
    const { data: org } = await supabase
      .from('organizations')
      .select('name, settings')
      .eq('id', organization_id)
      .single()

    const slackConfig = org?.settings?.slack as SlackConfig | undefined
    if (!slackConfig?.webhook_url) {
      return new Response(JSON.stringify({ error: 'Slack not configured' }), { status: 400 })
    }

    // Build Slack Block Kit message
    const blocks = buildSlackBlocks(type, data, org?.name || 'TestForge')

    // Send to Slack webhook
    const slackResponse = await fetch(slackConfig.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: slackConfig.channel,
        blocks,
        text: getPlainText(type, data), // Fallback for notifications
      }),
    })

    if (!slackResponse.ok) {
      return new Response(JSON.stringify({ error: 'Slack webhook failed' }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: 'Notification sent' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

function buildSlackBlocks(type: NotificationType, data: Record<string, unknown>, orgName: string) {
  const emoji = {
    crash: ':rotating_light:',
    device_offline: ':warning:',
    pass_rate_drop: ':chart_with_downwards_trend:',
    weekly_summary: ':bar_chart:',
  }

  const blocks: unknown[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${emoji[type]} TestForge Alert`,
      },
    },
  ]

  switch (type) {
    case 'crash':
      blocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*New ${data.severity} crash detected*\n${data.title}`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Occurrences:*\n${data.occurrence_count}` },
            { type: 'mrkdwn', text: `*Fingerprint:*\n\`${data.fingerprint}\`` },
            { type: 'mrkdwn', text: `*Devices:*\n${(data.affected_devices as string[])?.join(', ') || 'N/A'}` },
            { type: 'mrkdwn', text: `*Assigned:*\n${data.assigned_team || 'Unassigned'}` },
          ],
        }
      )
      if (data.jira_ticket) {
        blocks.push({
          type: 'section',
          text: { type: 'mrkdwn', text: `:jira: Jira ticket: *${data.jira_ticket}*` },
        })
      }
      break

    case 'device_offline':
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Device offline:* ${data.device_name}\nLast seen: ${data.last_seen}\nConnection: ${data.connection_type || 'unknown'}`,
        },
      })
      break

    case 'pass_rate_drop':
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Pass rate dropped to ${data.pass_rate}%*\n${data.total_runs} runs in the last 24 hours. ${data.total_passed}/${data.total_tests} tests passed.`,
        },
      })
      break

    case 'weekly_summary':
      blocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Weekly Summary for ${orgName}*`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Test Runs:*\n${data.total_runs}` },
            { type: 'mrkdwn', text: `*Pass Rate:*\n${data.pass_rate}%` },
            { type: 'mrkdwn', text: `*Active Devices:*\n${data.active_devices}` },
            { type: 'mrkdwn', text: `*New Crashes:*\n${data.new_crashes}` },
          ],
        }
      )
      break
  }

  blocks.push(
    { type: 'divider' },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `TestForge | ${orgName} | ${new Date().toISOString().split('T')[0]}` },
      ],
    }
  )

  return blocks
}

function getPlainText(type: NotificationType, data: Record<string, unknown>): string {
  switch (type) {
    case 'crash': return `TestForge: New ${data.severity} crash — ${data.title}`
    case 'device_offline': return `TestForge: Device offline — ${data.device_name}`
    case 'pass_rate_drop': return `TestForge: Pass rate dropped to ${data.pass_rate}%`
    case 'weekly_summary': return `TestForge: Weekly report — ${data.total_runs} runs, ${data.pass_rate}% pass rate`
    default: return 'TestForge Alert'
  }
}
