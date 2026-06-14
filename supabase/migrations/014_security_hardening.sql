-- 014_security_hardening.sql
-- Data-protection hardening for enterprise use:
--   1. API keys are no longer directly readable/writable over the data API.
--      They are managed only through SECURITY DEFINER RPCs, and key hashes are
--      never exposed to clients. The ingestion gateway reads them with the
--      service role.
--   2. A tamper-evident audit trail records security-relevant events.

-- ---------------------------------------------------------------------------
-- 1. Lock down api_keys
-- ---------------------------------------------------------------------------

-- Remove the permissive org-member policies created in 010 for api_keys.
DROP POLICY IF EXISTS "Org members can view api_keys"   ON api_keys;
DROP POLICY IF EXISTS "Org members can insert api_keys"  ON api_keys;
DROP POLICY IF EXISTS "Org admins can update api_keys"   ON api_keys;
DROP POLICY IF EXISTS "Org admins can delete api_keys"   ON api_keys;

-- No direct table access for clients. All access goes through the RPCs below
-- (SECURITY DEFINER) or the ingestion gateway (service role). This guarantees
-- a key hash can never be selected by a tenant, even by an org admin.
REVOKE ALL ON api_keys FROM anon, authenticated;

-- Safe listing for the dashboard — returns metadata only, never key_hash.
CREATE OR REPLACE FUNCTION list_api_keys(p_org_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    key_prefix TEXT,
    permissions TEXT[],
    is_active BOOLEAN,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT k.id, k.name, k.key_prefix, k.permissions, k.is_active,
           k.last_used_at, k.expires_at, k.created_at
    FROM api_keys k
    WHERE k.organization_id = p_org_id
      AND EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid() AND p.organization_id = p_org_id
      )
    ORDER BY k.created_at DESC;
$$;

REVOKE ALL ON FUNCTION list_api_keys(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION list_api_keys(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Audit trail
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor UUID REFERENCES profiles(id),
    action TEXT NOT NULL,            -- e.g. api_key.created, api_key.revoked
    target TEXT,                     -- human-readable target (key name / id)
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_org_time ON audit_events(organization_id, created_at DESC);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Members may read their org's audit log; nobody may write it directly.
-- Inserts happen only via SECURITY DEFINER functions or the service role,
-- which keeps the trail tamper-evident from a tenant's perspective.
REVOKE ALL ON audit_events FROM anon, authenticated;
GRANT SELECT ON audit_events TO authenticated;

DROP POLICY IF EXISTS "Org members can view audit log" ON audit_events;
CREATE POLICY "Org members can view audit log"
    ON audit_events FOR SELECT
    USING (organization_id = get_user_org_id());

-- ---------------------------------------------------------------------------
-- 3. Record key lifecycle events in the audit trail
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION create_api_key(p_org_id UUID, p_name TEXT)
RETURNS TABLE (id UUID, name TEXT, api_key TEXT, key_prefix TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_key    TEXT;
    v_hash   TEXT;
    v_prefix TEXT;
    v_id     UUID;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.organization_id = p_org_id
    ) THEN
        RAISE EXCEPTION 'Not authorized for this organization';
    END IF;

    v_key    := 'tf_' || encode(gen_random_bytes(24), 'hex');
    v_hash   := encode(digest(v_key, 'sha256'), 'hex');
    v_prefix := left(v_key, 11);

    INSERT INTO api_keys (organization_id, name, key_hash, key_prefix, created_by)
    VALUES (p_org_id, p_name, v_hash, v_prefix, auth.uid())
    RETURNING api_keys.id INTO v_id;

    INSERT INTO audit_events (organization_id, actor, action, target, metadata)
    VALUES (p_org_id, auth.uid(), 'api_key.created', p_name, jsonb_build_object('key_id', v_id, 'key_prefix', v_prefix));

    RETURN QUERY SELECT v_id, p_name, v_key, v_prefix;
END;
$$;

CREATE OR REPLACE FUNCTION revoke_api_key(p_key_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org  UUID;
    v_name TEXT;
BEGIN
    SELECT organization_id, name INTO v_org, v_name FROM api_keys WHERE id = p_key_id;
    IF v_org IS NULL THEN
        RETURN false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.organization_id = v_org
          AND profiles.role IN ('owner', 'admin')
    ) THEN
        RAISE EXCEPTION 'Not authorized to revoke keys for this organization';
    END IF;

    UPDATE api_keys SET is_active = false WHERE id = p_key_id;

    INSERT INTO audit_events (organization_id, actor, action, target, metadata)
    VALUES (v_org, auth.uid(), 'api_key.revoked', v_name, jsonb_build_object('key_id', p_key_id));

    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION create_api_key(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_api_key(UUID) TO authenticated;
