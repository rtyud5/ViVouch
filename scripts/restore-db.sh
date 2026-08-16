#!/usr/bin/env bash
set -euo pipefail

: "${TARGET_DATABASE_URL:?Set TARGET_DATABASE_URL to a separate restore database}"
backup_path="${1:?Usage: TARGET_DATABASE_URL=... scripts/restore-db.sh path/to/backup.dump}"

if [[ ! -f "$backup_path" ]]; then
  printf 'Backup not found: %s\n' "$backup_path" >&2
  exit 1
fi

pg_restore \
  --dbname="$TARGET_DATABASE_URL" \
  --clean \
  --if-exists \
  --exit-on-error \
  --no-owner \
  --no-acl \
  "$backup_path"

printf 'Restore completed into TARGET_DATABASE_URL. Run migrations and canonical smoke next.\n'
