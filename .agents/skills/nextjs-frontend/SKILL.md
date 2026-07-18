---
name: nextjs-frontend
description: Next.js 15 App Router frontend development guide for DocuMind — folder layout, Server vs Client components, data fetching, form handling, Tailwind CSS v4 styling, shadcn/ui usage, and responsive design patterns.
---

# Next.js Frontend Skill

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **shadcn/ui** components
- **Inter** (UI font) + **JetBrains Mono** (code/data font)

## Folder Layout

```
frontend/
├── app/
│   ├── (public)/              # Public pages (no auth required)
│   │   ├── page.tsx           # Landing page
│   │   ├── pricing/page.tsx
│   │   ├── about/page.tsx
│   │   └── layout.tsx         # Public layout (navbar + footer)
│   ├── (auth)/                # Auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (app)/                 # Authenticated app
│   │   ├── layout.tsx         # App shell (sidebar + topbar)
│   │   ├── dashboard/page.tsx
│   │   ├── inbox/page.tsx
│   │   ├── documents/
│   │   │   ├── page.tsx       # Document library
│   │   │   └── [id]/page.tsx  # Document detail
│   │   ├── review/page.tsx
│   │   ├── chat/
│   │   │   ├── page.tsx
│   │   │   └── [sessionId]/page.tsx
│   │   ├── reminders/page.tsx
│   │   ├── search/page.tsx
│   │   └── settings/
│   │       ├── layout.tsx     # Settings sidebar
│   │       ├── profile/page.tsx
│   │       ├── workspace/page.tsx
│   │       ├── members/page.tsx
│   │       ├── storage/page.tsx
│   │       ├── ai/page.tsx
│   │       ├── api-keys/page.tsx
│   │       └── audit/page.tsx
│   ├── layout.tsx             # Root layout (fonts, providers)
│   └── globals.css            # Tailwind imports + CSS variables
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── layout/                # Sidebar, Topbar, Footer, Navbar
│   ├── documents/             # DocumentCard, DocumentTable, EntityPanel
│   ├── chat/                  # ChatInput, ChatMessage, SourceCard
│   ├── upload/                # DropZone, UploadProgress, FilePreview
│   └── shared/                # StatsCard, EmptyState, ConfidenceBadge
├── lib/
│   ├── api.ts                 # Centralized API client (fetch wrapper)
│   ├── auth.ts                # Auth helpers (token management)
│   ├── utils.ts               # cn(), formatDate, formatCurrency, etc.
│   └── constants.ts           # Routes, status enums, config
├── hooks/
│   ├── use-documents.ts       # Document CRUD hooks
│   ├── use-upload.ts          # Upload with progress
│   ├── use-search.ts          # Search with debounce
│   └── use-auth.ts            # Auth state management
├── types/
│   ├── document.ts            # Document, Entity, Tag types
│   ├── user.ts                # User, Workspace types
│   ├── chat.ts                # Chat, Message types
│   └── api.ts                 # API response wrapper types
└── public/
    ├── fonts/
    ├── icons/
    └── images/
```

## Server vs Client Components

### Use Server Components (default) for:

- Pages that primarily display data (dashboard, library, detail)
- Data fetching from API
- SEO-critical content (landing page, about)
- Layout components (sidebar, topbar — static structure)

### Use Client Components (`"use client"`) for:

- Interactive forms (login, upload, search filters)
- Real-time updates (upload progress, processing status)
- Browser API usage (drag-drop, clipboard, camera)
- Stateful UI (modals, drawers, tooltips, tabs with state)
- Chat interface (streaming, auto-scroll)

### Pattern: Server wrapper + Client island

```tsx
// app/(app)/documents/page.tsx — Server Component
import { DocumentLibrary } from "@/components/documents/document-library";

export default async function DocumentsPage() {
  const documents = await fetchDocuments(); // server-side fetch
  return <DocumentLibrary initialDocuments={documents} />;
}

// components/documents/document-library.tsx — Client Component
("use client");
export function DocumentLibrary({ initialDocuments }) {
  const [documents, setDocuments] = useState(initialDocuments);
  // ... interactive logic
}
```

## Data Fetching Patterns

### Server-side (preferred for initial load)

```tsx
// In Server Components or route handlers
const res = await fetch(`${API_URL}/documents`, {
  headers: { Authorization: `Bearer ${token}` },
  next: { revalidate: 60 }, // ISR cache
});
```

### Client-side (for mutations and real-time)

```tsx
// Using lib/api.ts wrapper
import { api } from "@/lib/api";

const documents = await api.get("/documents", { params: { page: 1 } });
await api.post("/documents", { body: formData });
await api.delete(`/documents/${id}`);
```

## UI Component Patterns

### shadcn/ui Usage

- Always import from `@/components/ui/`
- Extend with custom variants, don't modify base components
- Compose complex components from primitives

### Common Component Patterns

```tsx
// Stats card with gradient
<Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
  <CardHeader>...</CardHeader>
</Card>

// Glassmorphism panel
<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
  ...
</div>

// Confidence badge
<Badge variant={confidence > 0.8 ? "success" : confidence > 0.5 ? "warning" : "destructive"}>
  {Math.round(confidence * 100)}%
</Badge>
```

## Responsive Design

- Mobile-first approach
- Breakpoints: sm(640) md(768) lg(1024) xl(1280) 2xl(1536)
- Sidebar: collapsible on mobile, expanded on desktop
- Document detail: stacked on mobile, split-view on desktop
- Tables: horizontal scroll on mobile, full width on desktop

## Performance

- Use `next/image` for all images
- Lazy load below-fold components with `React.lazy` + Suspense
- Use skeleton loading states (never blank screens)
- Debounce search inputs (300ms)
- Virtualize long lists (react-window or similar)
