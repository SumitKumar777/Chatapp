FROM node:22-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
   python3 \
   python3-pip \
   build-essential \
   && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm 


COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./


COPY packages/types/package.json ./packages/types/

COPY packages/typescript-config/package.json ./packages/typescript-config/

COPY apps/wsbackend/package.json ./apps/wsbackend/

RUN pnpm install --frozen-lockfile


COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config
COPY apps/wsbackend ./apps/wsbackend

RUN pnpm --filter @repo/types build

WORKDIR /app/apps/wsbackend
RUN pnpm build


EXPOSE 8080

CMD [ "pnpm","start" ]
