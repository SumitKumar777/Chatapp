FROM node:24-alpine

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace configuration files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy package.json files for all workspace packages
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Copy http-backend package.json
COPY apps/http-backend/package.json ./apps/http-backend/

# Install dependencies for the entire workspace
RUN pnpm install --frozen-lockfile

# Copy all necessary source code
COPY packages/db ./packages/db
COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config
COPY apps/http-backend ./apps/http-backend

# Generate Prisma clients
WORKDIR /app/packages/db
RUN npx prisma generate

# Build the workspace dependencies
RUN pnpm --filter @repo/db build
RUN pnpm --filter @repo/types build

# Build the http-backend app
WORKDIR /app/apps/http-backend
RUN pnpm build

EXPOSE 3001

CMD [ "pnpm", "start" ]
