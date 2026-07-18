---
name: documind-architecture
description: DocuMind system architecture guide — modular monolith pattern, 3-tier architecture, API design conventions, folder structure, and component interaction patterns for the Document OCR & AI Filing System.
---

# DocuMind Architecture Skill

## System Overview

DocuMind is a **Document OCR & AI Filing System** built as a **modular monolith** with an async processing pipeline. It serves both personal and small business document management needs.

## 3-Tier Architecture

### Tier 1: Presentation (Next.js 15 App Router)

- Server Components for data-heavy pages (dashboard, library, detail)
- Client Components only for interactive elements (upload, chat, forms)
- Communicates with backend via REST API
- File uploads go directly to MinIO via presigned URLs (never through Next.js)

### Tier 2: Business Logic (FastAPI)

- **Interactive Path**: Auth, CRUD, search, chat — low latency, synchronous
- **Processing Path**: OCR, AI extraction, indexing, notifications — async via Celery workers
- Pattern: Router → Service → Repository
- All business rules enforced here, not in frontend

### Tier 3: Data & Processing

- **PostgreSQL 16**: Source of truth (FTS + pg_trgm + pgvector + RLS + JSONB)
- **MinIO**: Object storage (originals bucket + derivatives bucket)
- **Redis**: Queue broker (Celery) + cache + session store
- **Workers**: OCR Worker, AI Worker, Indexing Worker, Notification Worker

## Key Architectural Decisions

### 1. Presigned URL Upload Pattern

```
Frontend → API (request presigned URL) → MinIO (generates URL)
Frontend → MinIO (direct upload via presigned PUT)
Frontend → API (POST /complete-upload) → DB record + enqueue job
```

**Why**: Avoids memory spikes, bypasses Next.js 1MB Server Action limit, scales better.

### 2. Modular Monolith (not Microservices)

All services share one codebase but are logically separated:

```
backend/app/
├── api/v1/          # HTTP layer (thin)
├── services/        # Business logic (core)
├── repositories/    # Data access (DB)
├── workers/         # Async processors
├── core/            # Shared utilities (auth, storage, AI)
└── models/          # SQLAlchemy ORM models
```

**Why**: Reduces operational complexity, easier to debug, can extract services later.

### 3. Queue-Everything for Heavy Work

Any operation taking >500ms should go through Celery:

- OCR processing
- AI extraction
- Embedding generation
- Notification delivery
- Report generation

### 4. Multi-layered Search

```
Layer 1: PostgreSQL FTS (GIN index) — standard text search with ranking
Layer 2: pg_trgm — fuzzy matching, typo tolerance
Layer 3: pgvector (HNSW index) — semantic/conceptual search
Layer 4: Meilisearch (optional, Phase 3) — product-grade UX
```

## API Design Conventions

### URL Structure

```
/api/v1/auth/*           # Authentication
/api/v1/documents/*      # Document CRUD
/api/v1/upload/*          # Upload orchestration
/api/v1/search/*          # Search endpoints
/api/v1/chat/*            # Chat/RAG
/api/v1/reminders/*       # Reminder management
/api/v1/admin/*           # Admin operations
/api/v1/webhooks/*        # External integrations
```

### Response Format

```json
// Success
{
  "data": { ... },
  "meta": { "page": 1, "total": 42 }
}

// Error
{
  "detail": "Human-readable message",
  "code": "DOCUMENT_NOT_FOUND",
  "status": 404
}
```

### Pagination

- Cursor-based for feeds/timelines
- Offset-based for admin/list views
- Default page size: 20, max: 100

## Document Processing Pipeline

```
Upload → Validate → Store Original → Enqueue OCR
  → OCR (Tesseract/PaddleOCR) → Store PDF/A + pages
  → Classify (rules → ML → LLM fallback)
  → Extract entities (Document AI parser → LLM structured output)
  → Quality gate (confidence check → review queue if low)
  → Generate embeddings → Index (FTS + vectors)
  → Check reminder rules → Schedule notifications
  → Update document status → Notify user
```

## Error Handling Strategy

- **API**: Return structured error with code, never expose stack traces
- **Workers**: Retry with exponential backoff (max 3 retries), then move to dead letter queue
- **Frontend**: Toast notifications for user errors, error boundaries for crashes
