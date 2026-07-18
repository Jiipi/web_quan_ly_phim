import { defineConfig, devices } from "@playwright/test";

/**
 * Cấu hình Playwright cho E2E.
 * - Local: tái dùng server đang chạy ở :3000 (reuseExistingServer) — dev container hoặc `npm run start`.
 * - CI: build production rồi `npm run start` (ổn định hơn dev vì không biên dịch route theo yêu cầu).
 * Lưu ý: E2E tin cậy nhất khi chạy trên bản production build (dev server biên dịch on-demand
 * dễ gây timeout khi chạy nhiều test).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
