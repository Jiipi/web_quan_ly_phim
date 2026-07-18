import { test, expect, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("AI service", () => {
  test("POST /api/ai/summary trả JSON hợp lệ + lưu lại (GET đọc được)", async ({ page }) => {
    await login(page, "user@phimflow.com", "Password123!");

    const lib = await page.request.get("/api/library");
    const items = (await lib.json()) as Array<{ id: string }>;
    expect(items.length).toBeGreaterThan(0);
    const watchItemId = items[0].id;

    const res = await page.request.post("/api/ai/summary", { data: { watchItemId } });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      provider: string;
      summary: { summary: string };
    };
    expect(body.success).toBe(true);
    expect(body.provider).toBe("mock");
    expect(body.summary.summary.length).toBeGreaterThan(0);

    // Đã lưu -> GET đọc lại được.
    const saved = await page.request.get(`/api/ai/summary?watchItemId=${watchItemId}`);
    expect(saved.status()).toBe(200);
    const savedBody = (await saved.json()) as { summary: string } | null;
    expect(savedBody?.summary.length ?? 0).toBeGreaterThan(0);
  });

  test("POST /api/ai/summary không đăng nhập -> 401", async ({ request }) => {
    const res = await request.post("/api/ai/summary", { data: { watchItemId: "x" } });
    expect(res.status()).toBe(401);
  });

  test("UI /ai: tạo tóm tắt hiển thị kết quả", async ({ page }) => {
    await login(page, "user@phimflow.com", "Password123!");
    await page.goto("/ai");
    await page.getByRole("button", { name: /Tạo tóm tắt không spoil/ }).click();
    await expect(page.getByText(/Tóm tắt \(không spoil\)/).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("POST /api/ai/recommend trả gợi ý + resolve tmdbId", async ({ page }) => {
    await login(page, "user@phimflow.com", "Password123!");
    const res = await page.request.post("/api/ai/recommend", {
      data: { mood: "nhẹ nhàng, chữa lành" },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      provider: string;
      recommendations: Array<{ title: string; matchScore: number; tmdbId?: number }>;
    };
    expect(body.success).toBe(true);
    expect(body.provider).toBe("mock");
    expect(body.recommendations.length).toBeGreaterThan(0);
    // Ít nhất một gợi ý resolve được sang TMDb (thêm watchlist trực tiếp).
    expect(body.recommendations.some((r) => typeof r.tmdbId === "number")).toBe(true);
  });

  test("UI /ai mood tab: chọn tâm trạng hiện thẻ gợi ý", async ({ page }) => {
    await login(page, "user@phimflow.com", "Password123!");
    await page.goto("/ai");
    await page.getByRole("button", { name: /Gợi ý theo tâm trạng/ }).click();
    await page.getByRole("button", { name: /Chữa lành/ }).click();
    await expect(page.getByText(/AI Gợi Ý/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
