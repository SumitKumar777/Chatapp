FROM node:22-alpine

WORKDIR /app


RUN apk add --no-cache openssl libc6-compat

RUN npm install -g pnpm


COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./


COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/


COPY apps/http-backend/package.json ./apps/http-backend/


RUN pnpm install --frozen-lockfile


COPY packages/db ./packages/db
COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config

COPY apps/http-backend ./apps/http-backend


WORKDIR /app/packages/db
RUN npx prisma generate 


RUN pnpm --filter @repo/db build
RUN pnpm --filter @repo/types build


WORKDIR /app/apps/http-backend
RUN pnpm build

EXPOSE 3001

CMD ["sh", "-c", "cd /app/packages/db && npx prisma migrate deploy && cd /app/apps/http-backend && pnpm start"]

