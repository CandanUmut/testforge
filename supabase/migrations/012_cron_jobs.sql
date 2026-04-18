-- 012_cron_jobs.sql
-- pg_cron job configuration for automated monitoring

-- Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Note: These cron jobs invoke Supabase Edge Functions
-- The GUC settings app.settings.supabase_url and app.settings.service_role_key
-- must be set on the database for these to execute successfully.

-- Device Health Monitor — every 5 minutes
SELECT cron.schedule(
    'device-health-monitor',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/device-health-monitor',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- Pass Rate Monitor — every 15 minutes
SELECT cron.schedule(
    'pass-rate-monitor',
    '*/15 * * * *',
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/pass-rate-monitor',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- Weekly Report Generator — every Monday at 6am UTC
SELECT cron.schedule(
    'weekly-report',
    '0 6 * * 1',
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/weekly-report',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- Crash deduplication is triggered via database webhook (not cron)
-- Configure in Supabase Dashboard > Database > Webhooks:
--   Table: crashes
--   Events: INSERT
--   URL: {SUPABASE_URL}/functions/v1/crash-dedup
