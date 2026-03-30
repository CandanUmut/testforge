-- 010_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE crashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's org
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations: users can see their own org
CREATE POLICY "Users can view own org"
    ON organizations FOR SELECT
    USING (id = get_user_org_id());

CREATE POLICY "Owners can update own org"
    ON organizations FOR UPDATE
    USING (id = get_user_org_id() AND EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
    ));

-- Profiles: users can see teammates
CREATE POLICY "Users can view org members"
    ON profiles FOR SELECT
    USING (organization_id = get_user_org_id());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- All data tables: org-scoped access
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['devices', 'test_runs', 'test_results', 'crashes', 'logs', 'api_keys', 'alerts'])
    LOOP
        EXECUTE format('
            CREATE POLICY "Org members can view %1$s"
                ON %1$s FOR SELECT
                USING (organization_id = get_user_org_id());

            CREATE POLICY "Org members can insert %1$s"
                ON %1$s FOR INSERT
                WITH CHECK (organization_id = get_user_org_id());

            CREATE POLICY "Org admins can update %1$s"
                ON %1$s FOR UPDATE
                USING (organization_id = get_user_org_id());

            CREATE POLICY "Org admins can delete %1$s"
                ON %1$s FOR DELETE
                USING (organization_id = get_user_org_id() AND EXISTS (
                    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''owner'', ''admin'')
                ));
        ', tbl);
    END LOOP;
END $$;
