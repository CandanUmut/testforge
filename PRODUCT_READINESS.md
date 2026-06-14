# TestForge — Product Readiness Review (June 2026)

A review of the protocols, API documentation, installation/guides, and dashboard
UI against "ready to put in front of customers," plus the fixes applied in this
pass. Companion to [`MARKET_RESEARCH.md`](./MARKET_RESEARCH.md).

## TL;DR

The marketing site and dashboard demo were polished, but the **integration layer
that the product is sold on did not work end-to-end**. The documented ingestion
protocol could neither authenticate nor write to the real database. That is now
fixed with a proper ingestion gateway, and the docs/clients have been brought in
line with the actual schema.

---

## Findings & fixes

### 1. Authentication was fundamentally broken (critical → fixed)
- **Found:** RLS policies authorize on `auth.uid()` (a Supabase user JWT). API
  keys were stored as hashes with **no mechanism to authenticate a request**.
  Every documented CI/agent/reporter example used `Authorization: Bearer tf_xxx`
  directly against PostgREST (`/rest/v1/`), which cannot work — the key isn't a
  valid JWT, so the request is rejected or RLS returns nothing.
- **Fix:** Added a server-side **ingestion gateway** edge function
  (`supabase/functions/ingest`) that hashes the `tf_` key, looks it up in
  `api_keys`, resolves `organization_id` server-side, and writes with the service
  role. `supabase/config.toml` disables JWT verification for that one function.

### 2. The documented payloads didn't match the schema (critical → fixed)
- **Found:** Client examples referenced columns that don't exist:
  - run `duration` (real: `duration_ms`)
  - results `name` / `classname` (real: `test_name` / `test_class`)
  - crashes `device_name` / `error_message` / `detected_at` (real:
    `title` / `crash_type` / `first_seen_at` …) — and required `device_type`,
    `title`, `crash_type` were never sent, so inserts would fail outright.
  - device `battery_level` / `last_heartbeat` (real: `last_seen_at`, no battery
    column).
- **Fix:** The gateway owns a **stable public payload** (`device` / `run` /
  `results` / `crashes`) and maps it onto the real schema — inferring
  `crash_type`/`severity`, converting `duration`→`duration_ms`, normalizing
  statuses, auto-creating/linking devices, and storing `battery_level` in
  `metadata`. Crashes are **deduplicated by fingerprint** on the way in.

### 3. Reporter & agent rewired (fixed, tested)
- `scripts/testforge_reporter.py` now sends **one batch** to the gateway (with
  retry/backoff) instead of multiple raw PostgREST calls. Public methods
  (`push_junit_results`, `upsert_device_heartbeat`) keep their signatures, so the
  agent (`testforge_agent.py`) works unchanged.
- Verified locally: JUnit parsing → batch payload, crash auto-detection (kernel
  panic flagged, plain assertion not), and run/result counts all correct.

### 4. API key lifecycle had no backend (fixed)
- **Found:** Docs said "create a key, the full key is returned once" and "revoke
  from Settings," but there was no generation path and Settings produced a fake
  client-side `tfk_` key (wrong prefix).
- **Fix:** Added `create_api_key` / `revoke_api_key` RPCs
  (`013_api_key_management.sql`, `SECURITY DEFINER`, org-membership checks,
  SHA-256 hashing matching the gateway). Settings now uses the correct `tf_`
  format and honest copy behavior. API docs document the RPCs.

### 5. API documentation rewritten (fixed)
- `src/pages/ApiDocs.tsx` now presents the correct mental model: an **Ingestion
  API** (writes, `tf_` key) and a **Query API** (reads, Supabase JWT, RLS-scoped),
  with accurate field tables, the real column names, and working examples
  (cURL / Python / reporter). `Setup.tsx` cURL snippets updated to the gateway.

### 6. Installation & guides (reviewed — solid)
- `scripts/install.sh` (systemd service, hardening, key/URL prompts) and
  `SetupGuide.tsx` (Android / embedded / CI/CD / web paths, checklist) are
  well-built and remain accurate, since they drive the reporter CLI whose
  interface is unchanged.

### 7. Dashboard UI (reviewed — demo-ready)
- Dashboard, Test Runs, Crash Triage, Devices, Logs, Reports, and Settings
  render cleanly with realistic demo data, loading skeletons, and empty states.
  Suitable for the "See Live Demo" marketing flow.

## Deployment notes (for the live project)

These ship as repo artifacts (like the existing migrations/functions) and take
effect when applied to a Supabase project:

```bash
supabase db push                              # applies 013_api_key_management.sql
supabase functions deploy ingest --no-verify-jwt
```

The function needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (provided by
the platform). Create a key via Settings → API Keys (or the `create_api_key`
RPC) and point the reporter/agent at `--url <project-url> --api-key tf_...`.

## Still open (recommended next)

- Wire the Settings "New Key" button to the `create_api_key` RPC for live orgs
  (currently generates locally for the demo).
- Per-key permission scopes (read vs write) surfaced in the UI.
- An end-to-end smoke test against a real project (ingest → dashboard).
- Rate limiting / payload size caps on the ingestion function.
- Replace the legacy `/setup` page or merge it into `/docs/setup` to avoid drift.
