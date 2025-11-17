FROM node:24-alpine


ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
ARG NEXT_PUBLIC_WEBSOCKET_BACKEND_URL=ws://localhost:8080

WORKDIR /app

RUN npm install -g pnpm 

COPY  pnpm-workspace.yaml ./
COPY  package.json pnpm-lock.yaml ./


COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/


COPY apps/web/package.json ./apps/web/


RUN pnpm install --frozen-lockfile


COPY packages/types ./packages/types
COPY packages/ui ./packages/ui
COPY packages/typescript-config ./packages/typescript-config

COPY apps/web ./apps/web

RUN pnpm --filter @repo/types build

WORKDIR /app/apps/web


ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_WEBSOCKET_BACKEND_URL=$NEXT_PUBLIC_WEBSOCKET_BACKEND_URL

RUN pnpm build


EXPOSE 3000

CMD [ "pnpm","start" ]
