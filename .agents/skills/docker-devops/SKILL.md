---
name: docker-devops
description: Docker Compose orchestration, CI/CD pipeline, deployment, backup strategy, health checks, environment configuration, and monitoring setup for DocuMind services.
---

# Docker & DevOps Skill

## Service Architecture

```
docker-compose.yml services:
├── web         — Next.js frontend (port 3000)
├── api         — FastAPI backend (port 8000)
├── worker-ocr  — Celery OCR worker
├── worker-ai   — Celery AI/extraction worker
├── postgres    — PostgreSQL 16 + pgvector
├── redis       — Redis 7 (queue + cache)
├── minio       — MinIO (S3-compatible storage)
├── nginx       — Reverse proxy + SSL
└── meilisearch — (optional, Phase 3)
```

## Docker Compose

```yaml
# docker-compose.yml
version: "3.9"

x-common-env: &common-env
  DATABASE_URL: postgresql+asyncpg://documind:${DB_PASSWORD}@postgres:5432/documind
  REDIS_URL: redis://redis:6379/0
  MINIO_ENDPOINT: minio:9000
  MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
  MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
  JWT_SECRET: ${JWT_SECRET}

services:
  # --- Infrastructure ---
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: documind
      POSTGRES_USER: documind
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U documind"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 5s
      retries: 5

  # --- Application ---
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
    environment:
      <<: *common-env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app # Dev only: hot reload

  worker-ocr:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A app.workers.celery_app worker --queues=ocr --concurrency=2 --loglevel=info
    environment:
      <<: *common-env
    depends_on:
      - api
    volumes:
      - ocr_temp:/tmp/ocr # Temp storage for OCR processing

  worker-ai:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A app.workers.celery_app worker --queues=ai,indexing,notification --concurrency=4 --loglevel=info
    environment:
      <<: *common-env
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    depends_on:
      - api

  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://api:8000
      NEXT_PUBLIC_MINIO_URL: http://minio:9000
    depends_on:
      - api
    ports:
      - "3000:3000"

  # --- Reverse Proxy ---
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro # SSL certs
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - web
      - api

volumes:
  postgres_data:
  redis_data:
  minio_data:
  ocr_temp:
```

## Docker Compose Dev Overrides

```yaml
# docker-compose.dev.yml
version: "3.9"

services:
  api:
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    environment:
      DEBUG: "true"

  web:
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000

  worker-ocr:
    command: celery -A app.workers.celery_app worker --queues=ocr --concurrency=1 --loglevel=debug
    volumes:
      - ./backend:/app

  worker-ai:
    command: celery -A app.workers.celery_app worker --queues=ai,indexing,notification --concurrency=1 --loglevel=debug
    volumes:
      - ./backend:/app
```

## Dockerfiles

### Backend Dockerfile

```dockerfile
FROM python:3.12-slim

# Install system dependencies for OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-vie \
    tesseract-ocr-eng \
    ghostscript \
    libmagic1 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

## Environment Variables

```bash
# .env.example

# Database
DB_PASSWORD=change_me_in_production

# Redis
REDIS_URL=redis://redis:6379/0

# MinIO
MINIO_ACCESS_KEY=documind_access
MINIO_SECRET_KEY=change_me_in_production

# Auth
JWT_SECRET=change_me_use_openssl_rand_hex_64

# AI Providers (optional)
OPENAI_API_KEY=
GEMINI_API_KEY=
OLLAMA_BASE_URL=http://host.docker.internal:11434

# Notifications (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
TELEGRAM_BOT_TOKEN=

# App
APP_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:8000
```

## Backup Strategy

### 3-Stream Backup

```bash
# 1. Database — daily logical backup
pg_dump -U documind -F c documind > backup_$(date +%Y%m%d).dump

# 2. Object Storage — MinIO versioning + mc mirror
mc mirror --remove --watch minio/originals /backup/minio-originals/
mc mirror --remove --watch minio/derivatives /backup/minio-derivatives/

# 3. Config & Secrets
# Backup .env, nginx configs, docker-compose files
# Use encrypted backup for secrets
```

## Health Check Endpoints

```python
# backend/app/api/v1/health.py
@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    checks = {}

    # Database
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception:
        checks["database"] = "unhealthy"

    # Redis
    try:
        await redis.ping()
        checks["redis"] = "healthy"
    except Exception:
        checks["redis"] = "unhealthy"

    # MinIO
    try:
        storage.client.list_buckets()
        checks["minio"] = "healthy"
    except Exception:
        checks["minio"] = "unhealthy"

    status = "healthy" if all(v == "healthy" for v in checks.values()) else "degraded"
    return {"status": status, "checks": checks}
```

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_DB: test_documind
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/tests/

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: cd frontend && npm ci && npm run lint && npm run build
```

## Monitoring (Phase 3)

- **Prometheus** + **Grafana** for metrics
- **Sentry** for error tracking
- **Loki** for log aggregation
- Key metrics: API latency, OCR processing time, queue depth, error rate, storage usage
