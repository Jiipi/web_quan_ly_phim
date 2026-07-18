---
name: security-auth
description: Security and authentication guide for DocuMind — JWT auth with refresh tokens, Row Level Security, OWASP compliance, file upload security, presigned URL flow, secrets management, ACL enforcement, and comprehensive audit logging.
---

# Security & Auth Skill

## Authentication Flow

### JWT + Refresh Token Pattern

```
Login → Verify credentials → Issue access_token (30min) + refresh_token (7d)
  → Store refresh_token hash in DB
  → Client stores access_token in memory, refresh_token in httpOnly cookie

API Request → Extract Bearer token → Verify JWT → Extract user_id + workspace_id
  → Set session context (app.user_id, app.workspace_id) → Process request

Token Refresh → Send refresh_token → Verify & rotate → Issue new pair
  → Invalidate old refresh_token (one-time use)
```

### Implementation

```python
# core/security.py
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(user_id: str, workspace_id: str) -> str:
    payload = {
        "sub": user_id,
        "wid": workspace_id,
        "exp": datetime.utcnow() + timedelta(minutes=30),
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=7),
        "type": "refresh",
        "jti": str(uuid4()),  # Unique token ID for rotation
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(401, detail="Invalid or expired token")
```

## Authorization Model

### 3-Layer Authorization

```
Layer 1: Authentication (JWT valid?)
Layer 2: Workspace isolation (RLS — user belongs to workspace?)
Layer 3: Object-level authorization (ACL — user can access this specific document?)
```

### Object-Level Authorization (BOLA Prevention)

```python
# EVERY endpoint that takes an object ID must check authorization
# Never rely on frontend to filter — always verify server-side

async def check_document_access(
    document: Document,
    user: User,
    required_permission: str = "viewer",
) -> bool:
    # Owner always has access
    if document.owner_id == user.id:
        return True

    # Check workspace membership
    if document.workspace_id != user.workspace_id:
        return False

    # Check ACL
    acl = await get_document_acl(document.id, user.id)
    if not acl:
        return False

    # Check permission level
    permission_hierarchy = {"viewer": 1, "editor": 2, "admin": 3}
    return permission_hierarchy.get(acl.permission_level, 0) >= \
           permission_hierarchy.get(required_permission, 0)

    # Check expiry
    if acl.expires_at and acl.expires_at < datetime.utcnow():
        return False

    return True
```

### RLS Session Context

```python
# middleware/workspace.py
async def set_rls_context(session: AsyncSession, user: User):
    """Set PostgreSQL session variables for RLS policies."""
    await session.execute(
        text(f"SET LOCAL app.workspace_id = '{user.workspace_id}'")
    )
    await session.execute(
        text(f"SET LOCAL app.user_id = '{user.id}'")
    )
```

## File Upload Security

### OWASP File Upload Checklist

```python
# Allowlisted extensions
ALLOWED_EXTENSIONS = {
    ".pdf", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".tif",
    ".doc", ".docx", ".xls", ".xlsx", ".txt", ".csv",
}

# Max file sizes
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB per file
MAX_FILES_PER_UPLOAD = 20

def validate_upload(filename: str, content_type: str, size: int):
    # 1. Check extension (allowlist, not blocklist)
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise AppException(400, "INVALID_FILE_TYPE", f"File type {ext} not allowed")

    # 2. Don't trust Content-Type header — verify by magic bytes
    # Use python-magic to detect actual MIME type

    # 3. Check file size
    if size > MAX_FILE_SIZE:
        raise AppException(400, "FILE_TOO_LARGE", "Maximum file size is 50MB")

    # 4. Generate server-controlled filename (never use user filename)
    safe_name = f"{uuid4().hex}{ext}"
    return safe_name
```

### Presigned URL Security

```python
# core/storage.py
class StorageClient:
    def generate_presigned_upload_url(
        self,
        object_key: str,
        content_type: str,
        max_size: int = MAX_FILE_SIZE,
        expires_in: int = 3600,  # 1 hour
    ) -> str:
        """Generate presigned PUT URL for direct browser upload."""
        return self.client.presigned_put_object(
            bucket_name=self.bucket_originals,
            object_name=object_key,
            expires=timedelta(seconds=expires_in),
        )

    def generate_presigned_download_url(
        self,
        bucket: str,
        object_key: str,
        expires_in: int = 3600,
    ) -> str:
        """Generate presigned GET URL for secure download."""
        return self.client.presigned_get_object(
            bucket_name=bucket,
            object_name=object_key,
            expires=timedelta(seconds=expires_in),
        )
```

## Audit Logging

### What to Log

```python
AUDITED_ACTIONS = [
    # Document lifecycle
    "document.create", "document.update", "document.delete",
    "document.view", "document.download", "document.export",
    # Sharing
    "document.share", "document.unshare", "share_link.create", "share_link.revoke",
    # Auth
    "auth.login", "auth.logout", "auth.login_failed", "auth.token_refresh",
    # Permissions
    "acl.grant", "acl.revoke", "acl.update",
    # Admin
    "user.invite", "user.remove", "user.role_change",
    "workspace.update", "api_key.create", "api_key.revoke",
    # AI/Chat
    "chat.query", "chat.tool_call",
]
```

### Audit Logger

```python
async def audit_log(
    session: AsyncSession,
    action: str,
    user_id: UUID,
    workspace_id: UUID,
    document_id: UUID | None = None,
    details: dict | None = None,
    ip_address: str | None = None,
):
    log = AuditLog(
        action=action,
        user_id=user_id,
        workspace_id=workspace_id,
        document_id=document_id,
        details=details or {},
        ip_address=ip_address,
    )
    session.add(log)
    await session.flush()
```

## Security Headers

```python
# middleware — add to all responses
SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "0",  # Rely on CSP instead
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com; "
        "font-src 'self' fonts.gstatic.com; "
        "img-src 'self' data: blob:; "
        "connect-src 'self' api.openai.com; "
    ),
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}
```

## Rate Limiting

```python
# Per-endpoint rate limits
RATE_LIMITS = {
    "/api/v1/auth/login": "5/minute",
    "/api/v1/auth/register": "3/minute",
    "/api/v1/upload/presign": "30/minute",
    "/api/v1/chat/message": "20/minute",
    "/api/v1/search": "60/minute",
    "default": "100/minute",
}
```

## ACL Propagation to Vector Store

```python
# When document permissions change:
async def propagate_acl_change(document_id: UUID, new_acl: dict):
    """OWASP RAG Security: ACL must be updated in vector store."""
    # 1. Update search_chunks.acl_metadata
    await update_chunk_acl(document_id, new_acl)

    # 2. Invalidate any cached RAG responses
    await invalidate_cache(f"rag:doc:{document_id}")

    # 3. If document deleted → cascade delete chunks
    # ON DELETE CASCADE handles this in PostgreSQL
```

## Secrets Management

- Store all API keys, JWT secrets, DB passwords in `.env` (dev) or secret manager (prod)
- Never commit secrets to git
- Rotate JWT secret periodically
- Log secret access and rotation events
- Use separate keys per environment (dev/staging/prod)
