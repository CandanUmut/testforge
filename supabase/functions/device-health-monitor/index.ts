// Device Health Monitor — runs every 5 minutes via pg_cron
// Checks for stale heartbeats and creates/clears alerts accordingly

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const HEARTBEAT_THRESHOLD_MINUTES = 30

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all organizations
    const { data: orgs } = await supabase.from('organizations').select('id')
    if (!orgs) return new Response(JSON.stringify({ message: 'No organizations found' }), { status: 200 })

    let totalChecked = 0
    let alertsCreated = 0
    let devicesRecovered = 0

    for (const org of orgs) {
      // Get all devices for this org
      const { data: devices } = await supabase
        .from('devices')
        .select('id, name, serial_number, status, last_heartbeat, connection_type, firmware_version')
        .eq('organization_id', org.id)

      if (!devices) continue

      const thresholdTime = new Date(Date.now() - HEARTBEAT_THRESHOLD_MINUTES * 60 * 1000).toISOString()

      for (const device of devices) {
        totalChecked++

        // Check for stale heartbeat on online/testing devices
        if (['online', 'testing'].includes(device.status) && device.last_heartbeat) {
          if (device.last_heartbeat < thresholdTime) {
            // Device has gone stale — mark offline and create alert
            await supabase
              .from('devices')
              .update({ status: 'offline', updated_at: new Date().toISOString() })
              .eq('id', device.id)

            // Check if alert already exists for this device
            const { data: existingAlerts } = await supabase
              .from('alerts')
              .select('id')
              .eq('organization_id', org.id)
              .eq('type', 'device_offline')
              .eq('related_entity_id', device.id)
              .eq('is_read', false)
              .limit(1)

            if (!existingAlerts?.length) {
              await supabase.from('alerts').insert({
                organization_id: org.id,
                type: 'device_offline',
                severity: 'warning',
                title: `${device.name} offline — no heartbeat for ${HEARTBEAT_THRESHOLD_MINUTES}+ minutes`,
                message: `Device ${device.serial_number || device.name} last seen at ${device.last_heartbeat}. Connection type: ${device.connection_type || 'unknown'}. Firmware: ${device.firmware_version || 'unknown'}.`,
                related_entity_type: 'device',
                related_entity_id: device.id,
              })
              alertsCreated++
            }
          }
        }

        // Check for devices that came back online (heartbeat within threshold, status is offline)
        if (device.status === 'offline' && device.last_heartbeat && device.last_heartbeat >= thresholdTime) {
          await supabase
            .from('devices')
            .update({ status: 'online', updated_at: new Date().toISOString() })
            .eq('id', device.id)

          // Clear any unread offline alerts for this device
          await supabase
            .from('alerts')
            .update({ is_read: true })
            .eq('organization_id', org.id)
            .eq('type', 'device_offline')
            .eq('related_entity_id', device.id)
            .eq('is_read', false)

          devicesRecovered++
        }
      }
    }

    return new Response(JSON.stringify({
      message: 'Device health check complete',
      devices_checked: totalChecked,
      alerts_created: alertsCreated,
      devices_recovered: devicesRecovered,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
