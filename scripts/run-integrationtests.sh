docker-compose -f docker-compose.test.yaml up -d --build
echo ' - Waiting for database to be ready...'
./scripts/wait-for-it.sh "postgresql://user:pass@localhost:5432/db" -- echo ' - Database is ready!'
echo ' - Running migrations...'
pnpm --filter @repo/db run  prisma migrate deploy
pnpm --filter @repo/http-backend run test:integration

docker-compose -f docker-compose.test.yaml down