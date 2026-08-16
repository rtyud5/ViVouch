#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required; refusing to reset an unspecified database." >&2
  exit 1
fi

if [[ "${NODE_ENV:-development}" == "production" ]]; then
  echo "Refusing to reset a production database." >&2
  exit 1
fi

npm --prefix "$ROOT_DIR/backend" exec prisma migrate reset -- --force
echo "Database reset, migrations applied, and seed completed."
