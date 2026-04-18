-- 011_seed_demo_data.sql
-- Enhanced handle_new_user trigger, dashboard stats RPC, and demo seed data
-- Run after migrations 001-010 have been applied

-- ─── Enhanced handle_new_user trigger ────────────────────────────────────────
-- Creates an organization on signup and a profile linked to that org with role 'owner'
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    user_name TEXT;
    org_slug TEXT;
BEGIN
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    org_slug := lower(regexp_replace(split_part(NEW.email, '@', 2), '[^a-z0-9]', '-', 'g'))
                || '-' || substr(NEW.id::text, 1, 8);

    -- Create a default organization for the new user
    INSERT INTO public.organizations (name, slug, plan)
    VALUES (user_name || '''s Organization', org_slug, 'starter')
    RETURNING id INTO new_org_id;

    -- Create profile linked to that org with owner role
    INSERT INTO public.profiles (id, email, full_name, organization_id, role)
    VALUES (
        NEW.id,
        NEW.email,
        user_name,
        new_org_id,
        'owner'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger (drop if exists from migration 002)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Dashboard stats RPC ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_dashboard_stats(org_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    week_start TIMESTAMPTZ := date_trunc('week', now());
    prev_week_start TIMESTAMPTZ := date_trunc('week', now() - interval '7 days');
BEGIN
    SELECT json_build_object(
        'totalRunsThisWeek', (
            SELECT COUNT(*) FROM test_runs
            WHERE organization_id = org_uuid AND created_at >= week_start
        ),
        'passRate', (
            SELECT COALESCE(
                ROUND(COUNT(*) FILTER (WHERE status = 'passed')::numeric /
                      NULLIF(COUNT(*) FILTER (WHERE status IN ('passed','failed','error','timeout')), 0) * 100, 1),
                0
            )
            FROM test_runs
            WHERE organization_id = org_uuid AND created_at >= week_start
        ),
        'activeDevices', (
            SELECT COUNT(*) FROM devices
            WHERE organization_id = org_uuid AND status IN ('online', 'testing')
        ),
        'openCrashes', (
            SELECT COUNT(*) FROM crashes
            WHERE organization_id = org_uuid AND status NOT IN ('fixed', 'wont_fix', 'duplicate')
        ),
        'passRateTrend', (
            SELECT COALESCE(
                ROUND(
                    (COUNT(*) FILTER (WHERE status = 'passed' AND created_at >= week_start)::numeric /
                     NULLIF(COUNT(*) FILTER (WHERE status IN ('passed','failed','error','timeout') AND created_at >= week_start), 0) * 100)
                    -
                    (COUNT(*) FILTER (WHERE status = 'passed' AND created_at >= prev_week_start AND created_at < week_start)::numeric /
                     NULLIF(COUNT(*) FILTER (WHERE status IN ('passed','failed','error','timeout') AND created_at >= prev_week_start AND created_at < week_start), 0) * 100)
                , 1),
                0
            )
            FROM test_runs
            WHERE organization_id = org_uuid
        ),
        'runsTrend', (
            SELECT COALESCE(
                (SELECT COUNT(*) FROM test_runs WHERE organization_id = org_uuid AND created_at >= week_start) -
                (SELECT COUNT(*) FROM test_runs WHERE organization_id = org_uuid AND created_at >= prev_week_start AND created_at < week_start),
                0
            )
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create demo org
INSERT INTO organizations (id, name, slug, plan) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'TestForge Demo', 'testforge-demo', 'professional')
ON CONFLICT (id) DO NOTHING;

-- Create demo devices
INSERT INTO devices (id, organization_id, name, device_type, serial_number, firmware_version, status, connection_type, last_seen_at) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Pixel 8 Pro #1',       'android',  'PX8P-001-A',  'android-14-r27', 'online',      'adb',  now()),
    ('d1000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Pixel 8 Pro #2',       'android',  'PX8P-002-B',  'android-14-r27', 'testing',     'adb',  now()),
    ('d1000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'IoT Sensor Hub v3',    'iot',      'IOTS-003-C',  'fw-2.4.1',       'online',      'uart', now()),
    ('d1000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'Smart Display Dev Kit','embedded', 'SDDK-004-D',  'fw-1.8.0',       'offline',     'ssh',  now() - interval '2 hours'),
    ('d1000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'NRF52 BLE Module',     'embedded', 'NRF-005-E',   'fw-3.1.2',       'online',      'uart', now()),
    ('d1000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 'T730 Modem Board',     'embedded', 'T730-006-F',  'fw-5.0.3',       'maintenance', 'adb',  now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Generate 120 test runs (last 30 days, realistic distributions)
INSERT INTO test_runs (
    id, organization_id, device_id, name, suite_name, trigger_type, status,
    total_tests, passed, failed, skipped, error_count,
    duration_ms, firmware_version, build_number, branch, environment,
    started_at, completed_at, created_at
)
SELECT
    gen_random_uuid(),
    'd0000000-0000-0000-0000-000000000001',
    (ARRAY[
        'd1000000-0000-0000-0000-000000000001',
        'd1000000-0000-0000-0000-000000000002',
        'd1000000-0000-0000-0000-000000000003',
        'd1000000-0000-0000-0000-000000000005',
        'd1000000-0000-0000-0000-000000000006'
    ]::uuid[])[floor(random() * 5 + 1)],
    (ARRAY['Smoke Test Suite','Full Regression','Power State Validation','Firmware Flash Verify','LTE Band Qualification','BLE Connectivity Test','Stress Test 24hr','OTA Update Validation'])[floor(random() * 8 + 1)],
    (ARRAY['smoke','regression','power','firmware','connectivity','stress'])[floor(random() * 6 + 1)],
    (ARRAY['ci_cd','ci_cd','ci_cd','scheduled','manual','webhook'])[floor(random() * 6 + 1)],
    CASE
        WHEN random() < 0.65 THEN 'passed'
        WHEN random() < 0.85 THEN 'failed'
        WHEN random() < 0.92 THEN 'error'
        ELSE 'timeout'
    END,
    floor(random() * 200 + 20)::int,
    0, 0, 0, 0,
    floor(random() * 3600000 + 60000)::int,
    'fw-' || floor(random() * 5 + 1)::text || '.' || floor(random() * 10)::text || '.' || floor(random() * 20)::text,
    'build-' || floor(random() * 500 + 100)::text,
    (ARRAY['main','main','develop','feature/power-opt','feature/ble-v2','hotfix/crash-fix'])[floor(random() * 6 + 1)],
    (ARRAY['staging','staging','production','development'])[floor(random() * 4 + 1)],
    now() - (random() * interval '30 days'),
    now() - (random() * interval '30 days') + (random() * interval '2 hours'),
    now() - (random() * interval '30 days')
FROM generate_series(1, 120);

-- Update pass/fail counts based on status
UPDATE test_runs SET
    passed     = CASE WHEN status = 'passed' THEN floor(total_tests * (0.9 + random() * 0.1))::int
                      ELSE floor(total_tests * (0.4 + random() * 0.3))::int END,
    failed     = CASE WHEN status = 'passed' THEN floor(total_tests * random() * 0.05)::int
                      ELSE floor(total_tests * (0.1 + random() * 0.3))::int END,
    skipped    = floor(total_tests * random() * 0.05)::int,
    error_count = CASE WHEN status IN ('error','timeout') THEN floor(random() * 5 + 1)::int ELSE 0 END
WHERE organization_id = 'd0000000-0000-0000-0000-000000000001';

-- Generate crashes
INSERT INTO crashes (organization_id, device_id, title, crash_type, severity, status, occurrence_count, stack_trace, ai_analysis, ai_suggested_fix, fingerprint, first_seen_at, last_seen_at)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001',
     'Kernel panic during suspend-to-RAM transition', 'kernel_panic', 'critical', 'investigating', 12,
     'kernel BUG at drivers/base/power/main.c:1187!'||chr(10)||'Call Trace:'||chr(10)||' dpm_suspend+0x234/0x450'||chr(10)||' suspend_devices_and_enter+0xc8/0x780'||chr(10)||' pm_suspend+0x2ec/0x380',
     'Pattern indicates a race condition in the power management driver during suspend. Related to known issue in kernel 5.15.x power management subsystem.',
     'Apply patch from kernel commit a3b2c1d. Pin USB hub driver state before initiating suspend sequence.',
     'kernel-panic-dpm-suspend-usb', now() - interval '5 days', now() - interval '2 hours'),

    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003',
     'OOM kill during BLE scanning + WiFi simultaneous', 'oom', 'high', 'new', 8,
     'Out of memory: Kill process 1847 (bt_scanner) score 420'||chr(10)||'Killed process 1847 (bt_scanner) total-vm:45320kB, anon-rss:38400kB',
     'Memory exhaustion when BLE scanning and WiFi AP mode are active simultaneously. The BLE scanner allocates ~38MB without pagination.',
     'Implement BLE scan result ring buffer with 4MB cap. Add memory pressure callback.',
     'oom-ble-scan-wifi-coexist', now() - interval '3 days', now()),

    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000006',
     'Modem firmware assert: invalid PDN context', 'assertion', 'high', 'identified', 23,
     'ASSERT FAILED: pdnCtx != NULL at modem/src/pdn_manager.c:445'||chr(10)||'#0 pdn_activate_default+0x128'||chr(10)||'#1 attach_procedure+0x340',
     'The PDN context becomes NULL when a network-initiated detach occurs during an ongoing service request.',
     'Add null check at pdn_manager.c:445. Queue service request to retry after re-attach.',
     'assert-pdn-null-detach-race', now() - interval '14 days', now() - interval '1 day'),

    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002',
     'ANR in SystemUI during notification flood', 'anr', 'medium', 'new', 5,
     'ANR in com.android.systemui'||chr(10)||'Reason: Input dispatching timed out (StatusBar)',
     'ANR triggered when >50 notifications arrive within 2 seconds. UI thread starvation.',
     'Batch notification updates using 500ms debounce. Collapse notifications beyond threshold.',
     'anr-systemui-notif-flood', now() - interval '7 days', now() - interval '3 days'),

    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005',
     'Watchdog reset: BLE stack unresponsive', 'watchdog', 'critical', 'fixed', 45,
     'WDT: Task bt_task not responding for 15000ms'||chr(10)||'Reset reason: WATCHDOG'||chr(10)||'Last state: BLE_ADV_START',
     'BLE advertising start command blocks indefinitely. Missing timeout on HCI command response wait loop.',
     'Added 3-second timeout to HCI command response wait. Fix deployed in fw-3.1.3.',
     'wdt-ble-adv-hci-hang', now() - interval '20 days', now() - interval '10 days');

-- Generate alerts
INSERT INTO alerts (organization_id, type, severity, title, message, is_read, created_at) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'crash_detected',   'critical', 'New critical crash: Kernel panic during suspend',        'Kernel panic detected on Pixel 8 Pro #1. 12 occurrences in the last 5 days.',                                       false, now() - interval '2 hours'),
    ('d0000000-0000-0000-0000-000000000001', 'test_failure',     'warning',  'Regression: Power State Validation suite failing',        '3 consecutive failures on T730 Modem Board. Pass rate dropped from 94% to 67%.',                                   false, now() - interval '6 hours'),
    ('d0000000-0000-0000-0000-000000000001', 'device_offline',   'warning',  'Smart Display Dev Kit offline for 2+ hours',              'Device SDDK-004-D last seen 2 hours ago. Connection type: SSH.',                                                    true,  now() - interval '2 hours'),
    ('d0000000-0000-0000-0000-000000000001', 'flaky_test',       'info',     'Flaky test detected: ble_connection_stability',           'Test ble_connection_stability has failed 4 out of last 10 runs.',                                                   true,  now() - interval '1 day'),
    ('d0000000-0000-0000-0000-000000000001', 'threshold_breach', 'warning',  'Build failure rate above 20% threshold',                  'Branch feature/ble-v2 has 35% build failure rate over the last 48 hours.',                                          false, now() - interval '12 hours'),
    ('d0000000-0000-0000-0000-000000000001', 'system',           'info',     'Weekly report generated',                                 'Summary: 47 test runs, 82% pass rate, 3 new crashes detected, 1 crash resolved.',                                   true,  now() - interval '2 days');

-- Generate sample logs
INSERT INTO logs (organization_id, device_id, level, source, message, timestamp) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'error', 'kernel',          'BUG: unable to handle page fault at 0000000000001370',                            now() - interval '1 hour'),
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'warn',  'power_mgr',       'suspend aborted: wakelock "usb_host" held for 30s',                               now() - interval '59 minutes'),
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'info',  'ble_stack',       'Advertising started on handle 0x01, interval 100ms',                              now() - interval '30 minutes'),
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'error', 'ble_stack',       'HCI command timeout: LE_SET_ADV_PARAMS (0x2006)',                                 now() - interval '25 minutes'),
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 'info',  'firmware',        'OTA update check: current=3.1.2, latest=3.1.3',                                   now() - interval '15 minutes'),
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000006', 'fatal', 'modem',           'ASSERT: pdnCtx != NULL at pdn_manager.c:445',                                     now() - interval '10 minutes'),
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000006', 'error', 'modem',           'NAS: EMM detach received during service request',                                  now() - interval '9 minutes'),
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'warn',  'android',         'ActivityManager: ANR in com.android.systemui (StatusBar)',                        now() - interval '3 hours'),
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'info',  'testforge_agent', 'Test run started: Smoke Test Suite (build-412, fw-5.0.3)',                        now() - interval '45 minutes'),
    ('d0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'info',  'testforge_agent', 'Test run completed: 48/50 passed, 2 failed, 0 skipped (duration: 12m 34s)',      now() - interval '32 minutes');
