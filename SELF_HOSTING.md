# TestForge — Self-Hosting / On-Premise Guide

**Short version:** you do not have to send any data to Supabase's cloud.
Supabase is open-source and self-hostable, and TestForge only uses standard
Supabase primitives (Postgres + PostgREST, GoTrue auth / `auth.uid()` RLS, edge
functions, the service role). So the **entire stack runs on a server inside your
lab** — database, API, ingestion gateway, and dashboard. Test results, device
data, and crash logs never leave your network.

This is also the **Enterprise on-premise** offering described in
[`GO_TO_MARKET.md`](./GO_TO_MARKET.md) and [`SECURITY.md`](./SECURITY.md).

---

## Architecture (fully in-lab)

```
        Lab network (no egress required)
┌───────────────────────────────────────────────────────────┐
│  Test hosts / DUTs                                          │
│    └─ reporter / agent ──HTTPS──►  TestForge server        │
│                                     ┌─────────────────────┐ │
│                                     │ Reverse proxy (TLS) │ │
│                                     ├─────────────────────┤ │
│                                     │ Dashboard (static)  │ │
│                                     │ Kong API gateway    │ │
│                                     │ PostgREST  GoTrue   │ │
│                                     │ Edge fn: ingest     │ │
│                                     │ PostgreSQL (RLS)    │ │
│                                     └─────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

Everything in the box is one or more containers on your hardware.

## Prerequisites

- A Linux server in the lab (4 vCPU / 8 GB RAM is plenty to start), Docker + Docker Compose.
- `psql` and Node 20+ on a build/admin machine (can be the same server).
- A hostname for the server (e.g. `testforge.lab.internal`) and a TLS cert
  (internal CA is fine).

## Step 1 — Stand up self-hosted Supabase

Follow the official self-hosting guide (use the upstream compose stack):
<https://supabase.com/docs/guides/self-hosting/docker>

```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
# EDIT .env: set strong POSTGRES_PASSWORD and JWT_SECRET, then generate
# ANON_KEY and SERVICE_ROLE_KEY from the JWT secret, and set SITE_URL /
# API_EXTERNAL_URL to your lab hostname. See deploy/.env.example for the
# variables TestForge needs.
docker compose up -d
```

This gives you Postgres, Auth (GoTrue), PostgREST, the edge-function runtime,
Storage, and Studio — all local.

## Step 2 — Apply the TestForge schema

From this repo, point at the self-hosted database and apply all migrations
(creates tables, RLS, the ingestion key RPCs, and the audit trail):

```bash
export DATABASE_URL='postgresql://postgres:YOUR_PG_PASSWORD@localhost:5432/postgres'
./scripts/apply_migrations.sh
```

(Equivalently, `supabase db push` if you link the project with the CLI.)

> The migrations depend on the Supabase `auth` schema and the
> `anon` / `authenticated` / `service_role` roles — i.e. **self-hosted Supabase**,
> not a bare Postgres.

## Step 3 — Deploy the ingestion gateway

The `ingest` edge function authenticates `tf_` keys and writes with the service
role. Deploy it to your self-hosted functions runtime with JWT verification
disabled (it does its own auth):

```bash
supabase functions deploy ingest --no-verify-jwt \
  --project-ref <local> # or copy supabase/functions/ingest into the
                        # docker functions volume per the self-host docs
```

It reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the function
environment (already provided by the stack).

## Step 4 — Build and serve the dashboard

The dashboard is a static SPA. Build it pointing at your local Supabase and
serve it from the same server (nginx, Caddy, or the proxy you already run):

```bash
npm ci
VITE_BASE=/ \
VITE_SUPABASE_URL=https://testforge.lab.internal \
VITE_SUPABASE_ANON_KEY=YOUR_SELF_HOSTED_ANON_KEY \
npm run build
# serve ./dist as static files behind your TLS reverse proxy
```

(`VITE_BASE=/` serves it at the domain root; omit it to keep the `/testforge/`
sub-path used by the public demo.)

## Step 5 — Connect your lab & verify

1. Open the dashboard, create your organization and first user.
2. **Settings → API Keys** → create a key (`tf_…`, shown once).
3. Point the reporter/agent at your local server:
   ```bash
   export TESTFORGE_URL=https://testforge.lab.internal
   export TESTFORGE_API_KEY=tf_xxxxxxxxxxxx
   python3 scripts/smoke_ingest.py        # end-to-end check
   # then for real runs:
   python3 scripts/testforge_reporter.py \
     --junit-xml results.xml --device-name DUT-A001 \
     --suite-name post-flash-smoke --firmware-version v3.2.1
   ```
4. Confirm the run, device, and crash appear in the dashboard. Done — all traffic
   stayed inside the lab.

Install the always-on agent on a lab host with `scripts/install.sh` (it watches
a results directory and sends heartbeats); point it at the local URL/key.

## Air-gapped (no internet at all) notes

If the server has **no** outbound internet, handle these external references:

1. **Docker images** — pre-pull the Supabase images on a connected machine and
   transfer them (`docker save` / `docker load`), or use your internal registry.
2. **Edge function dependency** — `supabase/functions/ingest` imports
   `@supabase/supabase-js` from `esm.sh`. For air-gapped runtimes, vendor it:
   pre-cache with Deno on a connected box (`deno cache`) and ship the cache, or
   switch the import to a local file / import map. (One small dependency.)
3. **Web fonts** — `index.html` loads Inter / JetBrains Mono from Google Fonts.
   For zero external calls, self-host the font files and update the `<link>`, or
   remove it to fall back to system fonts.

Everything else — ingestion, dashboard, database, auth — is already local.

## Operations

- **TLS:** terminate at your reverse proxy with an internal-CA cert; set
  `SITE_URL` / `API_EXTERNAL_URL` accordingly.
- **Backups:** `pg_dump` on a schedule (or your standard Postgres backup); the
  database is the single source of truth.
- **Upgrades:** pull new TestForge code, run `./scripts/apply_migrations.sh`
  (migrations are additive and ordered), rebuild the dashboard, redeploy `ingest`.
- **Updates from us:** ship as Git pulls; no phone-home, no license server.

## Security posture when self-hosted

You inherit everything in [`SECURITY.md`](./SECURITY.md) — tenant isolation via
RLS, hashed/scoped/revocable API keys never readable over the data API, the
audit trail, and ingestion size/batch limits — **plus** full network isolation:
the data plane has no dependency on any external service once images and the one
edge dependency are in place.

## Hardening checklist

- [ ] Unique, strong `POSTGRES_PASSWORD`, `JWT_SECRET`, and regenerated keys (never demo defaults)
- [ ] TLS everywhere; HTTP redirected to HTTPS
- [ ] Studio (Supabase dashboard) bound to localhost / VPN only, not exposed
- [ ] Database not reachable from outside the server; firewall to lab subnet
- [ ] Scheduled `pg_dump` backups, tested restore
- [ ] One API key per CI system / agent; rotate periodically
- [ ] Air-gapped items above resolved if no egress is allowed
