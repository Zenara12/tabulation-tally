#!/bin/sh
# =============================================================
# Docker entrypoint for Tabulation System
# 1. Waits for PostgreSQL to be ready
# 2. Runs Prisma migrations (safe to run on every deploy)
# 3. Starts the Nuxt/Nitro server
# =============================================================
set -e

echo ">>> Waiting for PostgreSQL to be ready..."

# Extract host and port from DATABASE_URL
# Format: postgresql://user:pass@host:port/dbname
DB_HOST=$(echo "$DATABASE_URL" | sed -e 's|.*@||' -e 's|:.*||' -e 's|/.*||')
DB_PORT=$(echo "$DATABASE_URL" | sed -e 's|.*:||' -e 's|/.*||')
DB_PORT=${DB_PORT:-5432}

MAX_RETRIES=30
RETRIES=0

until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  RETRIES=$((RETRIES + 1))
  if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
    echo ">>> ERROR: PostgreSQL not reachable after ${MAX_RETRIES} attempts. Exiting."
    exit 1
  fi
  echo ">>> Attempt ${RETRIES}/${MAX_RETRIES} — PostgreSQL not ready yet, retrying in 2s..."
  sleep 2
done

echo ">>> PostgreSQL is ready."

echo ">>> Running Prisma migrations..."
npx prisma migrate deploy

echo ">>> Migrations complete. Starting server..."
exec node .output/server/index.mjs
