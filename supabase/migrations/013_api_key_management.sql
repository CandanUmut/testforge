-- 013_api_key_management.sql
-- API key generation + revocation.
--
-- API keys are opaque `tf_` strings. We only ever store their SHA-256 hash;
-- the plaintext key is returned exactly once at creation time. The ingestion
-- gateway (supabase/functions/ingest) authenticates a key by hashing it and
-- matching api_keys.key_hash — the same SHA-256 hex used here.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create an API key for an organization the caller belongs to.
-- Returns the plaintext key ONCE — it cannot be retrieved again.
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
    -- Authorize: caller must be a member of the target organization.
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.organization_id = p_org_id
    ) THEN
        RAISE EXCEPTION 'Not authorized for this organization';
    END IF;

    -- tf_ + 48 hex chars of cryptographic randomness.
    v_key    := 'tf_' || encode(gen_random_bytes(24), 'hex');
    v_hash   := encode(digest(v_key, 'sha256'), 'hex');
    v_prefix := left(v_key, 11);

    INSERT INTO api_keys (organization_id, name, key_hash, key_prefix, created_by)
    VALUES (p_org_id, p_name, v_hash, v_prefix, auth.uid())
    RETURNING api_keys.id INTO v_id;

    RETURN QUERY SELECT v_id, p_name, v_key, v_prefix;
END;
$$;

-- Revoke (deactivate) an API key the caller's organization owns.
CREATE OR REPLACE FUNCTION revoke_api_key(p_key_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org UUID;
BEGIN
    SELECT organization_id INTO v_org FROM api_keys WHERE id = p_key_id;
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
    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION create_api_key(UUID, TEXT) FROM public, anon;
REVOKE ALL ON FUNCTION revoke_api_key(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION create_api_key(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_api_key(UUID) TO authenticated;
