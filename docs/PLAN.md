# PhimFlow — Kế hoạch tới Production

> Repo: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Prisma 7 + Postgres,
> NextAuth v5 (beta), Vercel AI SDK, Recharts, Framer Motion, cmdk.
>
> **Lưu ý thực thi:** bản Next.js này có breaking changes — đọc `node_modules/next/dist/docs/`
> trước khi viết code Next.js, tôn trọng cảnh báo deprecation.

## Quyết định đã chốt

- Phạm vi: review toàn diện + lộ trình đầy đủ tới production.
- Thứ tự: theo phase 0 → 4.
- Có kiểm chứng: chạy build/lint/typecheck, dựng Postgres, migrate + seed, test TMDb.
- Chưa có key (TMDb/AI/OAuth) → mọi tích hợp ngoài phải qua **adapter + mock fallback**,
  cắm key là chạy thật, không sửa code.
- AI trừu tượng hóa **đa provider** (openai | google | mock).
- **Đa người dùng thật**: login/register/onboarding, cô lập dữ liệu theo `userId`,
  nền cho chia sẻ list public.

## Vấn đề chặn deploy (xử lý sớm ở Phase 1)

- `src/lib/auth.ts`: `verifyPassword` giả (`password === "password123"`), chưa bcrypt.
- NextAuth trỏ `/login`, `/onboarding` nhưng 2 trang chưa tồn tại; landing đi thẳng dashboard.
- `(app)` layout không guard session; API `library`/`progress` có fallback `db.user.findFirst()`.
- AI 100% giả lập; chưa có `/api/ai/*`.
- Thiếu trang chi tiết `/movie/[id]`, `/show/[id]`; Discover chỉ có slide-over mock.
- Nhiều trang mock; `alert()/confirm()` khắp nơi; Ctrl+K, search topbar, chuông là placeholder.
- Chưa có `prisma/migrations`, chưa có test, README boilerplate, `.env` chỉ có `DATABASE_URL`.

## Task Breakdown

### PHASE 0 — Nền tảng & Kiểm chứng

- **T1** Baseline + audit: build/lint/tsc, Postgres, migrate+seed, test TMDb → báo cáo severity.
- **T2** Hạ tầng test + CI: Vitest + RTL + MSW + Playwright; GitHub Actions.
- **T3** Env/secret/format: `src/lib/env.ts` (zod), `.env.example`, secret mạnh, Prettier+Husky.
- **T4** Prisma migrations + seed đa user: `migrate dev --name init`, seed 2 user tách biệt.

### PHASE 1 — MVP core làm thật

- **T5** Vá auth + bcrypt hashing.
- **T6** Trang Login/Register + AuthN UI.
- **T7** Middleware guard + `getCurrentUserId()` + cô lập dữ liệu.
- **T8** Onboarding + lưu preferences thật.
- **T9** Toast + ConfirmDialog (thay alert/confirm).
- **T10** Wiring dữ liệu thật + loading/empty/error (Dashboard, Library, Watchlist, Continue-Watching).
- **T11** Trang chi tiết `/movie/[id]` và `/show/[id]`.

### PHASE 2 — AI thật (adapter + mock)

- **T12** Lớp AI service trừu tượng + provider mock.
- **T13** AI tóm tắt không spoil + lưu lịch sử.
- **T14** AI gợi ý + Mood.
- **T15** Ratings/Reviews thật + AI Taste Profile.

### PHASE 3 — Mở rộng

- **T16** Command Palette (Ctrl+K) + Global Search.
- **T17** Stats thật (aggregation).
- **T18** Calendar/Diary thật.
- **T19** Lists (CRUD) + Mood pages.
- **T20** Reminders + phát hiện "bỏ quên".
- **T21** Import/Export + Preferences/Profile/Settings thật.

### PHASE 4 — Production, Bảo mật & Vận hành

- **T22** Validate + rate limit + security headers + audit log.
- **T23** Error/Not-found/Loading + Error Boundary.
- **T24** Accessibility pass.
- **T25** Performance & Core Web Vitals.
- **T26** E2E toàn luồng + README + deploy + Production Readiness Scorecard.

## Quy tắc thực thi

- Mỗi task để lại một phần chạy được + có test, không code mồ côi.
- Chạy build/lint/typecheck sau mỗi thay đổi lớn.
- Chưa có key ngoài vẫn phải chạy được nhờ mock fallback.
