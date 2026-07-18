import { test, expect, type Page } from "@playwright/test";

async function registerNewUser(page: Page) {
  const email = `hard_${Date.now()}@phimflow.com`;
  await page.goto("/register");
  await page.getByLabel("Tên hiển thị").fill("Hardening Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Password123!");
  await page.getByLabel("Nhập lại mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await page.waitForURL("**/onboarding", { timeout: 15_000 });
}

test.describe("Hardening (rate limit + headers)", () => {
  test("security headers có mặt trên mọi response", async ({ request }) => {
    const res = await request.get("/login");
    const headers = res.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
  });

  test("rate limit: import quá 5 lần/phút -> 429", async ({ page }) => {
    await registerNewUser(page);
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await page.request.post("/api/import", { data: {} });
      statuses.push(res.status());
    }
    // 5 lần đầu OK (200), lần thứ 6 bị chặn (429).
    expect(statuses.filter((s) => s === 429).length).toBeGreaterThanOrEqual(1);
    expect(statuses.slice(0, 5).every((s) => s === 200)).toBe(true);
  });

  test("URL không tồn tại -> trang 404 tuỳ biến", async ({ page }) => {
    await page.goto("/khong-ton-tai-xyz");
    await expect(page.getByText("Không tìm thấy trang")).toBeVisible({ timeout: 10_000 });
  });
});
