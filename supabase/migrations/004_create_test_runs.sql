-- 004_create_test_suites_and_test_runs.sql

-- Test Suites
CREATE TABLE test_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('smoke', 'regression', 'stress', 'qualification', 'validation', 'custom')),
    estimated_duration_seconds INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_suites_org ON test_suites(organization_id);

-- Test Runs
CREATE TABLE test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    suite_name TEXT,
    trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'ci_cd', 'scheduled', 'webhook', 'api')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'passed', 'failed', 'error', 'cancelled', 'timeout')),
    total_tests INTEGER DEFAULT 0,
    passed INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    skipped INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    duration_ms INTEGER,
    firmware_version TEXT,
    build_number TEXT,
    branch TEXT,
    commit_sha TEXT,
    environment TEXT DEFAULT 'staging',
    metadata JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_test_runs_org ON test_runs(organization_id);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_runs_created ON test_runs(created_at DESC);
CREATE INDEX idx_test_runs_device ON test_runs(device_id);
