#!/bin/bash
# Development Environment Variables



# Source this file before running docker-compose: source ./set-env.sh


export JWT_SECRET="dev-secret-change-in-production-use-openssl-rand-base64-32"


export DATABASE_URL="postgresql://user:pass@postgres:5432/db"
export POSTGRES_USER="user"
export POSTGRES_PASSWORD="pass"
export POSTGRES_DB="db"


export REDIS_URL="redis://redis:6379"


export FRONTEND_URL="http://localhost:3000"
export NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
export NEXT_PUBLIC_WEBSOCKET_BACKEND_URL="ws://localhost:8080"


export NODE_ENV="production"

