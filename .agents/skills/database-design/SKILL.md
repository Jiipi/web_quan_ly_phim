---
name: database-design
description: PostgreSQL database design guide for DocuMind — schema definitions, Alembic migrations, Row Level Security (RLS), JSONB patterns, pgvector setup, full-text search indexing, and query optimization strategies.
---

# Database Design Skill

## Tech Stack

- **PostgreSQL 16** — source of truth
- **pgvector** — vector similarity search
- **pg_trgm** — trigram fuzzy matching
- **Alembic** — schema migrations
- **SQLAlchemy 2.0** — async ORM

## Schema Overview

### Core Tables

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Workspaces (tenants)
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    default_ocr_lang VARCHAR(20) DEFAULT 'vie+eng',
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    avatar_url VARCHAR(500),
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(workspace_id, email)
);

-- Documents (main entity)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    document_type VARCHAR(50),  -- invoice, contract, warranty, receipt, id_card, etc.
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'review', 'filed', 'error')),
    source VARCHAR(20) DEFAULT 'upload',  -- upload, email, api, scan
    checksum_sha256 VARCHAR(64),
    mime_type VARCHAR(100),
    language VARCHAR(20),
    -- Normalized fields for common queries
    issued_at DATE,
    due_at DATE,
    expires_at DATE,
    vendor_name VARCHAR(255),
    total_amount DECIMAL(15,2),
    currency VARCHAR(3),
    -- Search & AI
    search_text TEXT,  -- Full concatenated OCR text for FTS
    search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('simple', coalesce(search_text, ''))) STORED,
    extracted_json JSONB DEFAULT '{}',  -- Flexible extracted data
    ocr_confidence REAL,
    classifier_confidence REAL,
    needs_review BOOLEAN DEFAULT false,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document Files (originals + derivatives)
CREATE TABLE document_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('original', 'archive', 'thumbnail', 'page_image')),
    bucket VARCHAR(100) NOT NULL,
    object_key VARCHAR(500) NOT NULL,
    size_bytes BIGINT,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Document Pages (per-page OCR)
CREATE TABLE document_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    ocr_text TEXT,
    confidence REAL,
    image_key VARCHAR(500),  -- MinIO key for page image
    layout_data JSONB,  -- Bounding boxes, blocks, etc.
    UNIQUE(document_id, page_number)
);

-- Document Entities (extracted structured data)
CREATE TABLE document_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,  -- invoice_number, amount, date, vendor, etc.
    entity_key VARCHAR(100) NOT NULL,
    entity_value TEXT,
    source_parser VARCHAR(50),  -- tesseract, document_ai, llm_openai, etc.
    source_page INTEGER,
    confidence REAL,
    raw_data JSONB
);

-- Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366F1',
    match_type VARCHAR(20) DEFAULT 'manual' CHECK (match_type IN ('manual', 'auto', 'exact', 'regex')),
    match_pattern VARCHAR(500),
    UNIQUE(workspace_id, name)
);

CREATE TABLE document_tags (
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);

-- Reminders
CREATE TABLE document_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    reminder_type VARCHAR(30) DEFAULT 'expiry',
    remind_at TIMESTAMPTZ NOT NULL,
    channel VARCHAR(20) DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'telegram')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'dismissed', 'snoozed')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Access Control
CREATE TABLE document_acl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    grantee_id UUID NOT NULL REFERENCES users(id),
    grantee_type VARCHAR(10) DEFAULT 'user',
    permission_level VARCHAR(20) DEFAULT 'viewer' CHECK (permission_level IN ('viewer', 'editor', 'admin')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Search Chunks (for RAG/vector search)
CREATE TABLE search_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding VECTOR(1536),  -- OpenAI ada-002 / text-embedding-3-small
    classification VARCHAR(50),
    acl_metadata JSONB DEFAULT '{}',
    UNIQUE(document_id, chunk_index)
);

-- Chat
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    title VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    sources JSONB,  -- [{document_id, chunk_id, score, snippet}]
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    user_id UUID,
    document_id UUID,
    action VARCHAR(50) NOT NULL,  -- create, update, delete, view, share, export, login, etc.
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### Index Strategy

```sql
-- Documents: Full-text search
CREATE INDEX idx_documents_search_vector ON documents USING GIN(search_vector);

-- Documents: JSONB extracted data
CREATE INDEX idx_documents_extracted_json ON documents USING GIN(extracted_json);

-- Documents: Common filters
CREATE INDEX idx_documents_workspace_status ON documents(workspace_id, status);
CREATE INDEX idx_documents_type ON documents(workspace_id, document_type);
CREATE INDEX idx_documents_expires ON documents(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_documents_vendor ON documents(workspace_id, vendor_name);
CREATE INDEX idx_documents_owner ON documents(owner_id);
CREATE INDEX idx_documents_needs_review ON documents(workspace_id, needs_review) WHERE needs_review = true;

-- Documents: Trigram for fuzzy search
CREATE INDEX idx_documents_title_trgm ON documents USING GIN(title gin_trgm_ops);
CREATE INDEX idx_documents_vendor_trgm ON documents USING GIN(vendor_name gin_trgm_ops);

-- Search chunks: Vector similarity (HNSW)
CREATE INDEX idx_search_chunks_embedding ON search_chunks USING hnsw(embedding vector_cosine_ops);
CREATE INDEX idx_search_chunks_workspace ON search_chunks(workspace_id);
CREATE INDEX idx_search_chunks_document ON search_chunks(document_id);

-- Entities
CREATE INDEX idx_entities_document ON document_entities(document_id);
CREATE INDEX idx_entities_type ON document_entities(entity_type, entity_key);

-- Reminders
CREATE INDEX idx_reminders_remind_at ON document_reminders(remind_at) WHERE status = 'scheduled';
CREATE INDEX idx_reminders_user ON document_reminders(user_id, status);

-- Audit logs (partition by month recommended for large deployments)
CREATE INDEX idx_audit_workspace_time ON audit_logs(workspace_id, created_at DESC);
CREATE INDEX idx_audit_document ON audit_logs(document_id) WHERE document_id IS NOT NULL;
```

### Row Level Security (RLS)

```sql
-- Enable RLS on tenant-scoped tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Workspace isolation policy
CREATE POLICY workspace_isolation ON documents
    FOR ALL
    USING (workspace_id = current_setting('app.workspace_id')::uuid);

-- Search chunks follow document access
CREATE POLICY chunk_workspace_isolation ON search_chunks
    FOR ALL
    USING (workspace_id = current_setting('app.workspace_id')::uuid);

-- Session context setting (done in middleware)
-- SET LOCAL app.workspace_id = '<uuid>';
-- SET LOCAL app.user_id = '<uuid>';
```

## Alembic Migration Pattern

```python
# migrations/env.py — use async engine
from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

# Each migration file:
# migrations/versions/001_initial_schema.py
def upgrade():
    op.create_table("workspaces", ...)
    op.create_table("users", ...)
    # ...

def downgrade():
    op.drop_table("users")
    op.drop_table("workspaces")
```

## Query Patterns

### Full-text search with ranking

```sql
SELECT *, ts_rank(search_vector, query) AS rank
FROM documents, plainto_tsquery('simple', 'hóa đơn điện') AS query
WHERE search_vector @@ query
  AND workspace_id = $1
ORDER BY rank DESC
LIMIT 20;
```

### Fuzzy search with trigram

```sql
SELECT *, similarity(vendor_name, 'vinfast') AS sim
FROM documents
WHERE vendor_name % 'vinfast'
  AND workspace_id = $1
ORDER BY sim DESC;
```

### Semantic search with pgvector

```sql
SELECT sc.*, d.title, d.document_type,
       1 - (sc.embedding <=> $1::vector) AS similarity
FROM search_chunks sc
JOIN documents d ON d.id = sc.document_id
WHERE sc.workspace_id = $2
ORDER BY sc.embedding <=> $1::vector
LIMIT 10;
```
