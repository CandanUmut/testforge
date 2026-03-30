-- 006_create_crashes.sql
CREATE TABLE crashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    test_run_id UUID REFERENCES test_runs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    crash_type TEXT NOT NULL CHECK (crash_type IN ('kernel_panic', 'anr', 'native_crash', 'java_exception', 'segfault', 'watchdog', 'oom', 'assertion', 'timeout', 'power_failure', 'unknown')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'identified', 'fixed', 'wont_fix', 'duplicate')),
    occurrence_count INTEGER DEFAULT 1,
    first_seen_at TIMESTAMPTZ DEFAULT now(),
    last_seen_at TIMESTAMPTZ DEFAULT now(),
    stack_trace TEXT,
    log_snippet TEXT,
    root_cause TEXT,
    ai_analysis TEXT,
    ai_suggested_fix TEXT,
    assigned_to UUID REFERENCES profiles(id),
    fingerprint TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crashes_org ON crashes(organization_id);
CREATE INDEX idx_crashes_severity ON crashes(severity);
CREATE INDEX idx_crashes_status ON crashes(status);
CREATE INDEX idx_crashes_fingerprint ON crashes(fingerprint);
CREATE UNIQUE INDEX idx_crashes_unique_fingerprint ON crashes(organization_id, fingerprint) WHERE fingerprint IS NOT NULL;
