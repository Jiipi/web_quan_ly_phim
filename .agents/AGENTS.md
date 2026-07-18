# DocuMind — Project Rules

## General

- Language: Vietnamese for user-facing content, English for code/comments
- All code must be TypeScript (frontend) or Python 3.12+ (backend)
- Every file must have clear purpose — no "utils dump" files over 200 lines

## Frontend (Next.js)

- Use Next.js App Router exclusively (no Pages Router)
- Prefer Server Components by default; use `"use client"` only when needed (interactivity, hooks, browser APIs)
- Use Tailwind CSS v4 for all styling — no inline styles, no CSS modules
- Use shadcn/ui components — import from `@/components/ui/`
- All components go in `components/` with subdirectories by feature
- API calls go through `lib/api.ts` — never call fetch directly in components
- Use Inter font for UI text, JetBrains Mono for code/data display
- Dark mode first design — all colors use CSS custom properties

## Backend (FastAPI)

- Follow Router → Service → Repository pattern
- All endpoints must validate input with Pydantic schemas
- All endpoints must check authorization (no auth bypass)
- Use dependency injection for DB sessions, current user, services
- Background tasks go through Celery — never use FastAPI BackgroundTasks for heavy work
- All database queries use SQLAlchemy ORM with async sessions
- Return consistent error responses: `{"detail": "message", "code": "ERROR_CODE"}`

## Database (PostgreSQL)

- All tables must have `id` (UUID), `created_at`, `updated_at`
- Use Alembic for all schema migrations — never edit DB manually
- Enable RLS on all tenant-scoped tables
- Use JSONB for flexible/variable data; use typed columns for frequently queried fields
- Index strategy: GIN for FTS/JSONB, B-tree for foreign keys and filters, HNSW for vectors

## Security

- All API endpoints behind HTTPS
- JWT access tokens (short-lived) + refresh tokens (long-lived, rotated)
- Object-level authorization on every endpoint that takes an ID
- File uploads: allowlist extensions, server-generated filenames, size limits
- Presigned URLs for all file uploads — never stream through API
- Audit log every create/update/delete/share/export action
- Never expose internal errors to clients

## Code Style

- Max line length: 120 characters
- Use descriptive variable names — no single-letter variables except loop counters
- Functions should do one thing and be under 50 lines
- Always handle errors explicitly — no silent catches

## Git

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- One feature per branch, squash merge to main
