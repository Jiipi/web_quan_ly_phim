import { test, expect, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@phimflow.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("Stats", () => {
  test("GET /api/stats trả cấu trúc tổng hợp", async ({ page }) => {
    await login(page);
    const res = await page.request.get("/api/stats");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      totalEpisodes: number;
      byCountry: unknown[];
      byGenre: unknown[];
      history: unknown[];
    };
    expect(typeof body.totalEpisodes).toBe("number");
    expect(Array.isArray(body.byCountry)).toBe(true);
    expect(Array.isArray(body.byGenre)).toBe(true);
    expect(body.history).toHaveLength(7);
  });

  test("UI /stats hiển thị biểu đồ từ dữ liệu thật", async ({ page }) => {
    await login(page);
    await page.goto("/stats");
    await expect(page.getByRole("heading", { name: "Thống kê thói quen" })).toBeVisible();
    await expect(page.getByText("Xem theo quốc gia")).toBeVisible({ timeout: 10_000 });
  });
});
