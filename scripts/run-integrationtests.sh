#!/usr/bin/env bash
set -e


docker-compose -f docker-compose.test.yaml up -d --build


until PGPASSWORD="pass" psql -h localhost -U user -d db -c "SELECT 1" >/dev/null 2>&1; do
  echo "   Postgres not ready yet... retrying"
  sleep 1
done

echo ' - Waiting for Redis'
./scripts/wait-for-it.sh localhost:6379 -- echo ' - Redis is ready!'

echo ' - Running migrations'

pnpm --filter @repo/db run prisma migrate reset --force
pnpm --filter @repo/http-backend run test:integration


docker-compose -f docker-compose.test.yaml down
