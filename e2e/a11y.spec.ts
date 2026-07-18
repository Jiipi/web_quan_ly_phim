import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SEED_EMAIL = "user@phimflow.com";
const SEED_PASSWORD = "Password123!";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(SEED_EMAIL);
  await page.getByLabel("Mật khẩu").fill(SEED_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
}

// Chỉ chặn các lỗi nghiêm trọng (critical/serious) để tránh nhiễu.
async function scanCriticalSerious(page: Page) {
  // Đợi trang ổn định (title đã được Next chèn, mạng rảnh) trước khi quét.
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => document.title.trim().length > 0, null, { timeout: 10_000 });
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  return results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
}

test.describe("Accessibility (axe-core)", () => {
  test("trang /login không có lỗi a11y nghiêm trọng", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
    const violations = await scanCriticalSerious(page);
    expect(
      violations,
      JSON.stringify(
        violations.map((v) => v.id),
        null,
        2,
      ),
    ).toEqual([]);
  });

  test("trang /dashboard không có lỗi a11y nghiêm trọng", async ({ page }) => {
    await login(page);
    const violations = await scanCriticalSerious(page);
    expect(
      violations,
      JSON.stringify(
        violations.map((v) => v.id),
        null,
        2,
      ),
    ).toEqual([]);
  });

  test("trang /library không có lỗi a11y nghiêm trọng", async ({ page }) => {
    await login(page);
    await page.goto("/library");
    await page.waitForLoadState("networkidle");
    const violations = await scanCriticalSerious(page);
    expect(
      violations,
      JSON.stringify(
        violations.map((v) => v.id),
        null,
        2,
      ),
    ).toEqual([]);
  });
});
