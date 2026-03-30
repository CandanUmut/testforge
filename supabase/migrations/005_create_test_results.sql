-- 005_create_test_results.sql
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    test_class TEXT,
    test_category TEXT CHECK (test_category IN ('unit', 'integration', 'e2e', 'smoke', 'regression', 'performance', 'stress', 'power', 'firmware', 'hardware', 'custom')),
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'error', 'skipped', 'flaky', 'timeout')),
    duration_ms INTEGER,
    error_message TEXT,
    stack_trace TEXT,
    screenshot_url TEXT,
    log_url TEXT,
    retry_count INTEGER DEFAULT 0,
    is_flaky BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_test_results_run ON test_results(test_run_id);
CREATE INDEX idx_test_results_org ON test_results(organization_id);
CREATE INDEX idx_test_results_status ON test_results(status);
CREATE INDEX idx_test_results_flaky ON test_results(is_flaky) WHERE is_flaky = true;
