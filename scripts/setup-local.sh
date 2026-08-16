#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

npm --prefix "$ROOT_DIR/backend" ci
npm --prefix "$ROOT_DIR/backend" run prisma:generate
npm --prefix "$ROOT_DIR/frontend" ci

echo "ViVouch dependencies installed. Copy backend/.env.example to backend/.env, set DATABASE_URL, then run scripts/reset-db.sh."
