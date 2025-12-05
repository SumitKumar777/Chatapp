#!/bin/bash
set -e

docker-compose -f docker-compose.yaml up -d --build

echo "⏳ Waiting for application to be ready..."
./scripts/wait-for-it.sh localhost:3001 -- echo " Backend is ready"
./scripts/wait-for-it.sh localhost:3000 -- echo " Webapp is ready"


echo "Running E2E tests"
pnpm --filter e2e-tests run test:integration

echo "  Tests passed"

docker-compose -f docker-compose.yaml down