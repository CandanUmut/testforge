# TestForge — Testing Guide

How we test TestForge and how to verify a deployment. Tests run in CI on every
push/PR via `.github/workflows/tests.yml`.

## What's covered

| Layer | How | Where |
|---|---|---|
| Reporter (JUnit parsing, crash heuristics, batch payload) | `unittest` (stdlib, no deps, no network) | `scripts/test_reporter.py` |
| Frontend | `tsc --noEmit` type check + `vite build` | CI `frontend` job |
| Live ingestion (end-to-end) | manual smoke script against a real project | `scripts/smoke_ingest.py` |
| Dashboard UX | manual QA checklist (below) | — |

## Run the tests locally

```bash
# Reporter unit tests (Python 3, no dependencies)
python3 -m unittest discover -s scripts -p 'test_*.py' -v

# Frontend type check + build
npm ci
npx tsc --noEmit
npm run build
```

## Post-deploy smoke test (live project)

After `supabase db push` and `supabase functions deploy ingest --no-verify-jwt`,
create an API key (Settings → API Keys) and verify the full path:

```bash
export TESTFORGE_URL=https://your-project.supabase.co
export TESTFORGE_API_KEY=tf_xxxxxxxxxxxx
python3 scripts/smoke_ingest.py
```

Expect `HTTP 200`, `ok: true`, and a `run_id`. Then confirm in the dashboard
that the run, the `smoke-device`, and the crash appear.

### Negative checks (security)
- A bad/blank key → `401`.
- A revoked key → `401`.
- An oversized payload (> ~2 MB) or > 5000 results → `413`.
- A key from org A can never create data in org B (the gateway resolves the org
  from the key server-side).

## Manual QA checklist (demo & app)

- [ ] Landing renders; "See Live Demo" opens the dashboard with seed data.
- [ ] Dashboard KPIs, charts, recent runs, devices, alerts all populate.
- [ ] Test Runs list + detail; Crash Triage grouping; Log Explorer; Devices; Reports.
- [ ] Settings → API Keys: create shows a `tf_` key once; list/revoke work.
- [ ] `/trust` and `/docs/api` and `/docs/setup` render.
- [ ] Mobile nav (hamburger) works; no console errors.

## Roadmap

- Component tests for dashboard widgets (Vitest + React Testing Library).
- Contract test for the ingest function (Deno test with a stubbed Supabase client).
- E2E happy-path (Playwright) against the demo build.
