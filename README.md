# PhimFlow

Hệ điều hành xem phim cá nhân: quản lý watchlist, theo dõi tiến độ phim bộ, tóm tắt AI không spoil và phân tích gu xem phim. Ứng dụng đa người dùng, dữ liệu được cô lập theo từng tài khoản.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — dark cinematic design system (`src/app/globals.css`)
- **Prisma 7** + **PostgreSQL 16**
- **Auth.js v5** (NextAuth) — Credentials (bcrypt) + Google OAuth tùy chọn
- **Vercel AI SDK** — lớp AI đa provider (`openai | google | mock`)
- **Recharts**, **cmdk** (Ctrl+K), **framer-motion**, **lucide-react**
- **Vitest** + **Testing Library** + **MSW** (unit) · **Playwright** (E2E) · **axe-core** (a11y)

## Yêu cầu

- Node.js 20+ (khuyến nghị 22)
- Docker + Docker Compose (chạy PostgreSQL, hoặc dùng Postgres sẵn có)

## Bắt đầu nhanh

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env từ mẫu rồi điền giá trị
cp .env.example .env

# 3. Khởi động PostgreSQL (Docker)
docker compose up -d postgres

# 4. Áp migration + seed dữ liệu mẫu (2 người dùng)
npm run db:migrate
npm run db:seed

# 5. Chạy dev server
npm run dev
```

Mở http://localhost:3000.

## Tính năng chính

- 📚 **Thư viện cá nhân**: watchlist, lịch sử xem, danh sách tùy chỉnh, đánh giá nhiều tiêu chí
- 🎬 **Khám phá phim**: trending, top-rated, theo thể loại/quốc gia — tích hợp TMDb
- 🤖 **AI Assistant**: chatbot CineBot + tóm tắt phim bộ không spoil + gợi ý theo mood
- 📊 **Thống kê & cá nhân hoá**: heatmap lịch sử xem, taste profile, calendar
- 🌐 **Cộng đồng** (`/community`): đăng bài, bình luận, like, follow người dùng khác, news feed xếp theo thuật toán hot, trang cá nhân công khai (`/u/[handle]`), hộp thư thông báo real-time (polling)

## Tài khoản seed

Sau khi seed, đăng nhập bằng một trong hai tài khoản (mật khẩu: `Password123!`):

| Email                | Ghi chú                                             |
| -------------------- | --------------------------------------------------- |
| `user@phimflow.com`  | "Người Dùng Thử" — có sẵn thư viện + list công khai |
| `user2@phimflow.com` | "Minh Anh" — dữ liệu độc lập                        |

## Biến môi trường

Xem `.env.example` để biết mô tả đầy đủ. Tóm tắt:

| Biến                                              | Bắt buộc        | Mô tả                                            |
| ------------------------------------------------- | --------------- | ------------------------------------------------ |
| `DATABASE_URL`                                    | ✅              | Chuỗi kết nối PostgreSQL                         |
| `AUTH_SECRET`                                     | ✅ (production) | Secret ký JWT/session (≥16 ký tự)                |
| `AUTH_URL`                                        | —               | URL gốc app (Auth.js callback)                   |
| `TMDB_API_KEY`                                    | —               | Thiếu → dùng dữ liệu mock                        |
| `AI_PROVIDER`                                     | —               | `openai` \| `google` \| `mock` (mặc định `mock`) |
| `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | —               | Key AI theo provider                             |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`       | —               | Bật đăng nhập Google (cần cả hai)                |

> Chưa có key TMDb/AI vẫn chạy được: hệ thống tự fallback sang dữ liệu mock, cắm key vào là chạy thật mà không phải sửa code.

Sinh `AUTH_SECRET` mạnh:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Npm scripts

| Script                               | Việc                            |
| ------------------------------------ | ------------------------------- |
| `npm run dev`                        | Dev server (Turbopack)          |
| `npm run build` / `npm run start`    | Build + chạy production         |
| `npm run lint` / `npm run typecheck` | ESLint / kiểm tra kiểu          |
| `npm test` / `npm run test:coverage` | Unit test (Vitest)              |
| `npm run test:e2e`                   | E2E (Playwright)                |
| `npm run db:migrate` / `db:deploy`   | Áp migration (dev / production) |
| `npm run db:seed` / `db:reset`       | Seed / reset + seed lại DB      |
| `npm run format`                     | Prettier                        |

## Kiểm thử

```bash
npm test          # 112 unit test (schema, lib, component)
npm run test:e2e  # 41 E2E (auth, dữ liệu thật, AI, a11y, bảo mật...)
```

E2E chạy ổn định nhất trên **production build** (dev server biên dịch route theo yêu cầu dễ gây timeout khi chạy nhiều test cùng lúc):

```bash
docker compose up -d postgres
npm run db:reset          # dữ liệu tất định
npm run build && npm run start   # terminal riêng
npx playwright test --workers=1  # terminal khác
```

## Cấu trúc chính

```
src/
  app/(auth)/        # /login, /register (route group)
  app/(app)/         # trang cần đăng nhập: dashboard, library, discover,
                     #   watchlist, lists, calendar, ai, stats, movie/[id], show/[id]...
  app/api/           # route handlers (library, progress, ai/*, stats, lists, ...)
  auth.config.ts     # cấu hình Auth.js edge-safe (dùng cho proxy)
  proxy.ts           # bảo vệ route (Next 16 đổi tên middleware -> proxy)
  lib/               # env, auth, ai/, tmdb, stats, rate-limit, audit, ...
prisma/              # schema.prisma + migrations + seed.ts
e2e/                 # Playwright specs
docs/                # PLAN.md, BASELINE.md, SCORECARD.md
```

## Bảo mật & production

- Mật khẩu băm bằng **bcrypt**; không có backdoor.
- **Proxy** (`src/proxy.ts`) chặn mọi route trong `(app)` khi chưa đăng nhập; API tự trả 401.
- Mọi truy vấn dữ liệu **scope theo `userId`** — người dùng chỉ thấy dữ liệu của mình.
- **Rate limiting** in-memory cho AI (30/phút), TMDb (60/phút), import (5/phút).
- **Security headers** + CSP, **audit log** cho login/tạo/xoá/gọi AI (`next.config.ts`, `src/lib/audit.ts`).
- Validate mọi input bằng **zod**.

## Triển khai

### Vercel (khuyến nghị) + Postgres managed

1. Tạo Postgres managed (Neon / Supabase / Vercel Postgres), lấy `DATABASE_URL`.
2. Trên Vercel, đặt env: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` (domain thật), và (tùy chọn) `TMDB_API_KEY`, `AI_PROVIDER` + key AI, Google OAuth.
3. Chạy migration khi deploy: `npm run db:deploy` (đặt trong build command hoặc release step), rồi `npm run db:seed` một lần nếu cần dữ liệu mẫu.
4. Deploy — Next.js build tự động.

### Tự host (Docker)

`docker-compose.yml` hiện phục vụ **môi trường phát triển** (`Dockerfile.dev`, hot-reload). Cho production tự host, dùng multi-stage build (`next build` → `next start`), đặt `NODE_ENV=production` và cung cấp `DATABASE_URL` + `AUTH_SECRET` qua secret manager (không hardcode).

> Lưu ý bảo mật: `docker-compose.yml` chứa mật khẩu Postgres và `AUTH_SECRET` mặc định **chỉ dành cho dev**. Production phải override bằng biến môi trường thật.

## Tài liệu thêm

- `docs/PLAN.md` — kế hoạch 5 phase / 26 task
- `docs/BASELINE.md` — audit hiện trạng ban đầu
- `docs/SCORECARD.md` — Production Readiness Scorecard
