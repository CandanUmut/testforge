#!/usr/bin/env bash
# Apply all TestForge SQL migrations, in order, to a Postgres database.
#
# Intended for self-hosted Supabase, whose database provides the auth schema,
# the anon/authenticated/service_role roles, and the extensions schema that the
# migrations rely on. (A bare Postgres without Supabase will fail on auth.uid()
# and the role grants — run the full self-hosted Supabase stack instead.)
#
# Usage:
#   export DATABASE_URL='postgresql://postgres:PASSWORD@localhost:5432/postgres'
#   ./scripts/apply_migrations.sh
#
# Requires: psql
set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL, e.g. postgresql://postgres:pw@localhost:5432/postgres}"

command -v psql >/dev/null 2>&1 || { echo "ERROR: psql not found"; exit 1; }

MIGRATIONS_DIR="$(cd "$(dirname "$0")/../supabase/migrations" && pwd)"

echo "Applying migrations from ${MIGRATIONS_DIR}"
for f in $(ls "${MIGRATIONS_DIR}"/*.sql | sort); do
    echo "  → $(basename "$f")"
    psql "${DATABASE_URL}" -v ON_ERROR_STOP=1 -q -f "$f"
done

echo "All migrations applied."
