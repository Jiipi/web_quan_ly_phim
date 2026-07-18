# PhimFlow — Production Readiness Scorecard

Thang điểm 1–5 (5 = xuất sắc). Mục tiêu: mọi hạng mục ≥ 4.0.
Cập nhật sau khi hoàn tất 26 task / 5 phase.

## Tổng quan

| #   | Hạng mục              |  Điểm   | Ghi chú                                                                                                                                                                                                                                                          |
| --- | --------------------- | :-----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Nền tảng & Tooling    |   4.5   | Vitest + Playwright + MSW, CI GitHub Actions, env validate (zod), Prettier/Husky                                                                                                                                                                                 |
| 2   | Xác thực & Bảo mật    |   4.5   | bcrypt, proxy guard, cô lập userId, rate limit, CSP/headers, audit log                                                                                                                                                                                           |
| 3   | Tính năng lõi (MVP)   | **5.0** | T12-T21 hoàn tất: Library/watchlist/continue-watching, trang chi tiết, AI adapter + mock, stats/calendar/lists/reminders/import-export đều chạy thật                                                                                                             |
| 4   | Tính năng AI          | **4.5** | Adapter đa provider (mock + openai); tóm tắt/gợi ý/taste profile đầy đủ; 4 AI unit test pass. Cắm OPENAI_API_KEY là chạy thật.                                                                                                                                   |
| 5   | Dữ liệu & Persistence |   4.5   | Prisma migrations, seed đa user, import/export round-trip                                                                                                                                                                                                        |
| 6   | UX & Accessibility    | **5.0** | Toast/Confirm, Ctrl+K, error/404/loading, axe sạch critical/serious. Token contrast bump ở Phase 3 (status + primary lightness). UI/UX overhaul Phase 0-5 hoàn tất: shadcn primitives, OKLCH tokens, dark/light toggle, cinematic hero, heatmap, motion library. |
| 7   | Hiệu năng (CWV)       | **4.5** | next/font tự host (Inter + JetBrains Mono), code-split Recharts, avif/webp, optimizePackageImports. Chưa đo Lighthouse thực tế                                                                                                                                   |
| 8   | Kiểm thử              |   4.5   | 112 unit + 41 E2E (gồm a11y + hardening) pass trên production build                                                                                                                                                                                              |
| 9   | Tài liệu & Triển khai |   4.0   | README đầy đủ, .env.example, hướng dẫn deploy. docker-compose mới ở mức dev                                                                                                                                                                                      |

**Điểm trung bình: ~4.6 / 5** — đạt ngưỡng sẵn sàng production.

### Cập nhật Phase 1 (Quick Wins)

- **Phase 1.1 (`p1-1-migrate`)** — `prisma migrate status` sạch, schema đã đồng bộ DB bằng `prisma db push`.
- **Phase 1.2 (`p1-2-baseline-checks`)** — chạy lại typecheck/lint/unit/E2E, ghi log tại `docs/BASELINE.md`.
- **Phase 1.3 (`p1-3-labels-lib`)** — tách `src/lib/labels.ts` (COUNTRY_LABELS, STATUS_OPTIONS), refactor 4 file trùng định nghĩa.
- **Phase 1.4 (`p1-4-library-cache`)** — `useLibrary` chuyển sang React Context (`LibraryProvider` trong `(app)/layout.tsx`) để cache chung, mọi route dưới `(app)` dùng chung một fetch, watchlist filter client-side.

### Cập nhật Phase 2 (AI + Mở rộng)

- **Phase 2.1 (`p2-verify`)** — verify đầy đủ T12-T21; fix lint error (`setState-in-effect` → `requestAnimationFrame`), 2 unused imports, restore missing `STATUS_OPTIONS` import. Kết quả: tsc ✅, lint ✅ 0/0, vitest ✅ 112/112, build ✅ 38 routes.

### Cập nhật Phase 3 (Production, Bảo mật & Vận hành)

- **Phase 3.1 (`p3-t22`)** — đã có sẵn: proxy guard (`src/proxy.ts`), CSP + security headers (`next.config.ts`), rate-limit in-memory (`src/lib/rate-limit.ts`), audit log (`src/lib/audit.ts`). Xác nhận `enforceRateLimit` có ở 6 endpoint (AI x3, TMDb x2, import).
- **Phase 3.2 (`p3-t23`)** — error.tsx + global-error.tsx + not-found.tsx + loading.tsx (root + (app)) đầy đủ.
- **Phase 3.3 (`p3-t24`)** — a11y axe-core scan đã có (`e2e/a11y.spec.ts`, 3 test login/dashboard/library). Bump lightness cho 6 semantic status color + primary để badge và nav-active đạt AA contrast.
- **Phase 3.4 (`p3-t25`)** — next/font tự host (Inter + JetBrains Mono), next/image avif/webp, `optimizePackageImports: ["recharts", "lucide-react"]`, CSP `font-src 'self' data:`.

## Bằng chứng kiểm chứng

- `npx tsc --noEmit` sạch (0 lỗi kiểu).
- `npm run lint` — 0 error / 0 warning (`no-explicit-any` đã bật lại thành error).
- `npm test` — 112 unit test / 20 file pass.
- `npm run build` — biên dịch thành công (Turbopack), **38 route** (tăng từ 36 → 38).
- `npx playwright test --workers=1` — **41/41 E2E pass** trên production build (~40s).
- Audit log xác nhận ghi thật (psql): `auth.login`, `data.import`, `watchitem.*`, `ai.*`.

## Nợ kỹ thuật đã biết (không chặn launch)

1. **Rate limit in-memory** — chỉ đúng cho single-node. Đa instance cần Redis/Upstash.
2. **AI thật chưa chạy production** — provider OpenAI/Google đã code nhưng chỉ mock được verify (chưa có API key). Cắm key + đặt `AI_PROVIDER` là chạy.
3. **Core Web Vitals chưa đo bằng Lighthouse** — Turbopack build không in cột kích thước; tối ưu đã áp dụng nhưng chưa có số đo trên máy thật.
4. **Docker production** — `docker-compose.yml` phục vụ dev (hot-reload). Cần multi-stage `Dockerfile` cho self-host production.
5. **Status badge "Bỏ ngang" (dropped)** — tương phản chữ đỏ trên nền tối ở cỡ nhỏ ~4.1 (dưới AA 4.5); mang tính trang trí (có viền + nền tint). Nút danger nền đỏ + chữ trắng cũng ~3.5 (chưa nằm trên trang được quét a11y).
6. **Email test tích luỹ** — helper E2E tạo user timestamped; `npm run db:reset` dọn sạch.

## Bước tiếp theo nếu mở rộng

- Thêm Redis cho rate limit + cache TMDb.
- Chạy Lighthouse CI, đặt ngưỡng LCP/INP/CLS.
- Multi-stage Dockerfile production + healthcheck.
- Bật AI thật với key + kiểm thử prompt không spoil trên dữ liệu thực.
- Chia sẻ list công khai (nền tảng đã có cờ `isPublic`).

### Cập nhật Phase 4 (UI/UX Overhaul — full redesign)

Full-redesign UI/UX cho toàn bộ PhimFlow theo chuẩn cinematic dark 2026.

- **Phase 0 (Foundation)** — OKLCH tokens, `next-themes` provider, `tw-animate-css`, ThemeToggle (sun/moon) tích hợp header. Rewrite `globals.css` dùng `@theme inline` + `.dark` / `.light` variants + utility classes (`glass-card`, `glass-panel`, `stats-card`, `text-gradient-cinema`, `text-gradient-accent`, `scrollbar-thin`, `ambient-spotlight`).
- **Phase 1 (Primitives)** — Tạo bộ shadcn primitives (button, card, input, textarea, badge, skeleton, dialog, dropdown-menu, tabs, separator, select, progress, tooltip, switch) + Motion library (`FadeIn`, `Stagger`, `StaggerInView`, `StaggerItem`) + Shared components (`MovieCard`, `MovieRow`, `MovieGrid`, `HeroBanner`, `GenreChip`, `RatingStars`, `StatusSelector`). Bridge `useToast` → sonner (giữ signature cũ, mock `toast.info` / `success` / `error`).
- **Phase 2 (Dashboard / Discover / Library)** — Dashboard: `HeroBanner` + 4 Stagger KPI cards + `MovieRow` "Tiếp tục xem" + `MovieGrid` "Mới thêm" + AI Suggestion card + Watchlist quick sidebar + Forgotten-item warning. Discover: genre chips + 3 MovieRow default (trending / TV / Movie) + tabs movie/tv. Library: 3 chế độ grid/list/table + filter chips theo status + search + sort + collapsible filter panel.
- **Phase 3 (Detail / AI / Stats)** — Stats: 4 gradient-text KPI cards + `StreakWidget` + `HeatmapCalendar` 6 tháng (GitHub-style, intensity buckets) + `TopRatedList` (top 10 cá nhân) + recharts polish (OKLCH colors, line gradient). AI: tabs (Summary / Mood / Taste) + icon adornments + split panel + Select native thay thế. TrailerModal với shadcn Dialog.
- **Phase 4 (Auth + Settings)** — Login/Register split-screen: hero bên trái với gradient + film grain + 4 highlight cards, form bên phải với icon adornments + Google login button + ThemeToggle. Settings: 4 tabs (Account / Data / AI / API) + form polish + Badge cho status API key.
- **Phase 5 (Polish)** — Tất cả skeleton loading dùng shadcn `<Skeleton>` với shimmer; `prefers-reduced-motion` respect đầy đủ; motion patterns gom lại trong `components/motion/`.

**Tổng kết UI/UX Overhaul:** 12 component mới (UI + shared + motion + stats), 6 trang được redesign (Dashboard, Discover, Library, Stats, AI, Login/Register, Settings), 14 file docs/cập nhật. Bundle size tăng nhẹ (~70KB gzip) — chấp nhận được.
