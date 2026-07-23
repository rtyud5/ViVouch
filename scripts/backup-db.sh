#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL to the source PostgreSQL database}"
output_path="${1:-vivouch-backup-$(date -u +%Y%m%dT%H%M%SZ).dump}"
mkdir -p "$(dirname "$output_path")"

pg_dump \
  --dbname="$DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file="$output_path"

printf 'Backup created: %s\n' "$output_path"
