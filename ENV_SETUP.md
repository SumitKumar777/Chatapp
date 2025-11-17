# 🚀 Environment Setup Guide

This project uses **environment variables** for configuration. No `.env` files in docker-compose!

---

## 📋 Quick Start

### **Development (Local)**

```bash
# 1. Load environment variables
source ./set-env.sh

# 2. Start services
docker-compose up --build

# 3. Access services
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - WebSocket: ws://localhost:8080
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

---

## 🛠️ How It Works

### **Variable Substitution in docker-compose.yaml**

```yaml
environment:
  JWT_SECRET: ${JWT_SECRET}                    # Required - no default
  REDIS_URL: ${REDIS_URL:-redis://redis:6379}  # Optional - has default
```

**Syntax:**
- `${VAR}` - Required, must be set in environment
- `${VAR:-default}` - Optional, uses default if not set

### **Priority:**
1. **Shell environment** (highest)
2. **Default values** in `docker-compose.yaml`
3. Error if required var is missing

---

## 🏠 Development Setup

### **Option 1: Use the script (Recommended)**

```bash
# Load variables
source ./set-env.sh

# Verify
echo $JWT_SECRET

# Run docker-compose
docker-compose up --build
```

### **Option 2: Set manually**

```bash
export JWT_SECRET="your-secret"
export DATABASE_URL="postgresql://user:pass@postgres:5432/db"
# ... set other variables

docker-compose up --build
```

### **Option 3: One-liner**

```bash
JWT_SECRET=my-secret DATABASE_URL=postgresql://... docker-compose up
```

---

## 🚀 Production Deployment

### **Step 1: Create production script**

```bash
# Copy the template
cp set-env.prod.sh.example set-env.prod.sh

# Edit with real values
nano set-env.prod.sh
```

**set-env.prod.sh:**
```bash
#!/bin/bash
export JWT_SECRET="$(openssl rand -base64 32)"
export DATABASE_URL="postgresql://prod-user:secure-pass@prod-db.com/chatapp"
export REDIS_URL="redis://prod-redis.com:6379"
export FRONTEND_URL="https://mychatapp.com"
export NODE_ENV="production"
```

### **Step 2: Deploy**

```bash
# On production server
source ./set-env.prod.sh

# Deploy
docker-compose -f docker-compose.prod.yaml up -d

# Or without docker-compose
docker stack deploy -c docker-stack.yml chatapp
```

---

## ☁️ Cloud Platform Examples

### **AWS ECS**

Set environment variables in **Task Definition**:

```json
{
  "containerDefinitions": [{
    "environment": [
      {"name": "REDIS_URL", "value": "redis://prod-redis:6379"},
      {"name": "NODE_ENV", "value": "production"}
    ],
    "secrets": [
      {"name": "JWT_SECRET", "valueFrom": "arn:aws:secretsmanager:..."}
    ]
  }]
}
```

### **Kubernetes**

```bash
# Create secrets
kubectl create secret generic chatapp-secrets \
  --from-literal=jwt-secret='your-production-secret'

# Create configmap
kubectl create configmap chatapp-config \
  --from-literal=redis-url='redis://redis:6379'
```

**deployment.yaml:**
```yaml
env:
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: chatapp-secrets
        key: jwt-secret
  - name: REDIS_URL
    valueFrom:
      configMapKeyRef:
        name: chatapp-config
        key: redis-url
```

### **Vercel / Netlify**

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable:
   - `JWT_SECRET`
   - `NEXT_PUBLIC_BACKEND_URL`
   - etc.
3. Deploy!

### **Railway**

```bash
railway variables set JWT_SECRET=your-secret
railway variables set DATABASE_URL=postgresql://...
railway up
```

### **Heroku**

```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set DATABASE_URL=postgresql://...
git push heroku main
```

---

## 🔐 Security Best Practices

### ✅ DO:

1. **Generate strong secrets:**
   ```bash
   openssl rand -base64 32
   ```

2. **Never commit production secrets:**
   - `set-env.prod.sh` is in `.gitignore`
   - Only commit `.example` files

3. **Use different secrets per environment:**
   - Development: `set-env.sh`
   - Production: `set-env.prod.sh` (not in git)

4. **Rotate secrets regularly:**
   ```bash
   # Generate new secret
   NEW_SECRET=$(openssl rand -base64 32)
   
   # Update everywhere
   export JWT_SECRET="$NEW_SECRET"
   ```

### ❌ DON'T:

- Never hardcode secrets in `docker-compose.yaml`
- Never commit `set-env.prod.sh` to git
- Never share secrets via Slack/email
- Never log secret values

---

## 🔍 Troubleshooting

### **Error: "JWT_SECRET environment variable is required"**

**Problem:** Variable not set in shell.

**Solution:**
```bash
# Load the script
source ./set-env.sh

# Verify it's set
echo $JWT_SECRET
```

### **Docker Compose shows empty values**

**Problem:** Variables not exported to current shell.

**Solution:**
```bash
# Use 'source' or '.'
source ./set-env.sh    # ✅ Correct
./set-env.sh           # ❌ Wrong - runs in subshell
```

### **Variables not persisting**

**Problem:** Shell session ended.

**Solution:**
```bash
# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'source ~/projects/ChatApp/set-env.sh' >> ~/.bashrc

# Or create an alias
alias chat-env='source ~/projects/ChatApp/set-env.sh'
```

---

## 📊 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ Yes | None | JWT signing secret |
| `DATABASE_URL` | No | `postgresql://user:pass@postgres:5432/db` | PostgreSQL connection |
| `REDIS_URL` | No | `redis://redis:6379` | Redis connection |
| `FRONTEND_URL` | No | `http://localhost:3000` | CORS origin |
| `NODE_ENV` | No | `development` | Environment mode |
| `NEXT_PUBLIC_BACKEND_URL` | No | `http://localhost:3001` | Frontend → Backend |
| `NEXT_PUBLIC_WEBSOCKET_BACKEND_URL` | No | `ws://localhost:8080` | Frontend → WebSocket |

---

## 🎯 Verification

### **Check what's loaded:**

```bash
# After sourcing set-env.sh
printenv | grep -E 'JWT|DATABASE|REDIS'
```

### **Test in container:**

```bash
# Run a service
docker-compose up http-backend

# Check env vars inside
docker-compose exec http-backend printenv | grep JWT_SECRET
```

---

## 📚 Additional Resources

- [12-Factor App: Config](https://12factor.net/config)
- [Docker Compose: Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
