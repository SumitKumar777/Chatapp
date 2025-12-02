docker-compose -f docker-compose.test.yaml up -d --build
echo ' - Waiting for Postgres...'
./scripts/wait-for-it.sh localhost:5432 -- echo ' - Postgres is ready!'

echo ' - Waiting for Redis...'
./scripts/wait-for-it.sh localhost:6379 -- echo ' - Redis is ready!'

echo ' - Running migrations...'
pnpm --filter @repo/db run prisma migrate reset --force
pnpm --filter @repo/http-backend run test:integration

docker-compose -f docker-compose.test.yaml down
