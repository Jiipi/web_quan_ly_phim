---
name: fastapi-backend
description: FastAPI backend development guide for DocuMind — project structure, router/service/repository pattern, dependency injection, Pydantic schemas, async patterns, Celery workers, middleware, and error handling.
---

# FastAPI Backend Skill

## Tech Stack

- **FastAPI** (Python 3.12+)
- **SQLAlchemy 2.0** (async ORM)
- **Alembic** (migrations)
- **Pydantic v2** (validation & serialization)
- **Celery** + **Redis** (task queue)
- **python-jose** (JWT)
- **passlib** (password hashing)
- **boto3** / **minio** (S3/MinIO client)
- **httpx** (async HTTP client)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, lifespan, middleware
│   ├── config.py               # Settings from env (pydantic-settings)
│   ├── database.py             # Async engine, session factory
│   ├── dependencies.py         # Reusable dependencies
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py           # Root router (mount all v1 routes)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py         # Login, register, refresh, logout
│   │       ├── documents.py    # CRUD, list, filters
│   │       ├── upload.py       # Presigned URL, complete upload
│   │       ├── search.py       # FTS, fuzzy, semantic
│   │       ├── chat.py         # Chat sessions, messages, RAG
│   │       ├── reminders.py    # CRUD reminders, rules
│   │       ├── admin.py        # Users, workspace, audit
│   │       └── webhooks.py     # External integrations
│   │
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── base.py             # Base model with id, timestamps
│   │   ├── user.py
│   │   ├── workspace.py
│   │   ├── document.py         # Document, DocumentFile, DocumentPage
│   │   ├── entity.py           # DocumentEntity
│   │   ├── tag.py              # Tag, DocumentTag
│   │   ├── reminder.py
│   │   ├── acl.py              # DocumentACL
│   │   ├── search.py           # SearchChunk
│   │   ├── chat.py             # ChatSession, ChatMessage
│   │   └── audit.py            # AuditLog
│   │
│   ├── schemas/                # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── document.py
│   │   ├── upload.py
│   │   ├── search.py
│   │   ├── chat.py
│   │   ├── reminder.py
│   │   ├── admin.py
│   │   └── common.py           # Pagination, error, success wrappers
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── document_service.py
│   │   ├── upload_service.py
│   │   ├── search_service.py
│   │   ├── chat_service.py
│   │   ├── reminder_service.py
│   │   └── notification_service.py
│   │
│   ├── repositories/           # Data access layer
│   │   ├── __init__.py
│   │   ├── document_repo.py
│   │   ├── user_repo.py
│   │   ├── search_repo.py
│   │   ├── chat_repo.py
│   │   └── reminder_repo.py
│   │
│   ├── workers/                # Celery task definitions
│   │   ├── __init__.py
│   │   ├── celery_app.py       # Celery instance config
│   │   ├── ocr_worker.py       # OCR processing tasks
│   │   ├── ai_worker.py        # AI extraction tasks
│   │   ├── indexing_worker.py  # FTS + vector indexing
│   │   └── notification_worker.py
│   │
│   ├── core/                   # Shared infrastructure
│   │   ├── __init__.py
│   │   ├── security.py         # JWT encode/decode, password hash
│   │   ├── storage.py          # MinIO/S3 client wrapper
│   │   ├── ocr.py              # OCR engine router
│   │   ├── ai.py               # LLM client (OpenAI/Gemini/Ollama)
│   │   └── embedding.py        # Embedding generation
│   │
│   └── middleware/
│       ├── __init__.py
│       ├── auth.py             # JWT verification middleware
│       ├── cors.py             # CORS configuration
│       ├── rate_limit.py       # Rate limiting
│       └── workspace.py        # Workspace context injection
│
├── migrations/
│   ├── alembic.ini
│   ├── env.py
│   └── versions/               # Migration files
│
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_documents.py
│   └── ...
│
├── requirements.txt
├── Dockerfile
└── pyproject.toml
```

## Design Patterns

### Router → Service → Repository

```python
# api/v1/documents.py (Router - thin HTTP layer)
@router.get("/documents/{document_id}")
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
):
    document = await service.get_document(document_id, current_user)
    return SuccessResponse(data=DocumentResponse.model_validate(document))

# services/document_service.py (Service - business logic)
class DocumentService:
    def __init__(self, repo: DocumentRepository, storage: StorageClient):
        self.repo = repo
        self.storage = storage

    async def get_document(self, doc_id: UUID, user: User) -> Document:
        document = await self.repo.get_by_id(doc_id)
        if not document:
            raise HTTPException(404, detail="Document not found")
        if not self._can_access(document, user):
            raise HTTPException(403, detail="Access denied")
        return document

# repositories/document_repo.py (Repository - data access)
class DocumentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, doc_id: UUID) -> Document | None:
        result = await self.session.execute(
            select(Document).where(Document.id == doc_id)
        )
        return result.scalar_one_or_none()
```

### Dependency Injection

```python
# dependencies.py
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    return decode_and_validate_token(token)

def get_document_service(
    db: AsyncSession = Depends(get_db),
    storage: StorageClient = Depends(get_storage),
) -> DocumentService:
    repo = DocumentRepository(db)
    return DocumentService(repo, storage)
```

### Pydantic Schemas

```python
# schemas/document.py
class DocumentCreate(BaseModel):
    title: str = Field(max_length=500)
    document_type: str | None = None
    tags: list[UUID] = []

class DocumentResponse(BaseModel):
    id: UUID
    title: str
    document_type: str | None
    status: DocumentStatus
    ocr_confidence: float | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# schemas/common.py
class SuccessResponse(BaseModel, Generic[T]):
    data: T
    meta: dict | None = None

class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    meta: PaginationMeta
```

### Error Handling

```python
# Consistent error responses
class AppException(HTTPException):
    def __init__(self, status_code: int, code: str, detail: str):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code

# In main.py
@app.exception_handler(AppException)
async def app_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "code": exc.code},
    )
```

## Celery Worker Pattern

```python
# workers/celery_app.py
from celery import Celery
celery = Celery("documind", broker=settings.REDIS_URL)
celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# workers/ocr_worker.py
@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def process_ocr(self, document_id: str):
    try:
        # 1. Download from MinIO
        # 2. Run OCRmyPDF
        # 3. Upload PDF/A + page images
        # 4. Update DB with OCR text
        # 5. Enqueue AI extraction
        pass
    except Exception as exc:
        self.retry(exc=exc)
```

## Configuration

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    APP_NAME: str = "DocuMind"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 10

    # Redis
    REDIS_URL: str

    # MinIO
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET_ORIGINALS: str = "originals"
    MINIO_BUCKET_DERIVATIVES: str = "derivatives"

    # Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI
    OPENAI_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    OLLAMA_BASE_URL: str | None = None

    model_config = SettingsConfigDict(env_file=".env")
```
