import { test, expect, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@phimflow.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

async function firstWatchItemId(page: Page): Promise<string> {
  const lib = await page.request.get("/api/library");
  const items = (await lib.json()) as Array<{ id: string }>;
  expect(items.length).toBeGreaterThan(0);
  return items[0].id;
}

test.describe("Ratings / Reviews / Taste profile", () => {
  test("PUT /api/ratings lưu điểm + GET đọc lại", async ({ page }) => {
    await login(page);
    const watchItemId = await firstWatchItemId(page);

    const put = await page.request.put("/api/ratings", {
      data: { watchItemId, overallScore: 9, plotScore: 8, rewatchValue: true },
    });
    expect(put.status()).toBe(200);

    const get = await page.request.get(`/api/ratings?watchItemId=${watchItemId}`);
    const rating = (await get.json()) as { overallScore: number; rewatchValue: boolean } | null;
    expect(rating?.overallScore).toBe(9);
    expect(rating?.rewatchValue).toBe(true);
  });

  test("PUT /api/reviews lưu review + GET đọc lại", async ({ page }) => {
    await login(page);
    const watchItemId = await firstWatchItemId(page);

    const content = `Cảm nhận test ${Date.now()}`;
    const put = await page.request.put("/api/reviews", {
      data: { watchItemId, content, spoilers: false },
    });
    expect(put.status()).toBe(200);

    const get = await page.request.get(`/api/reviews?watchItemId=${watchItemId}`);
    const review = (await get.json()) as { content: string } | null;
    expect(review?.content).toBe(content);
  });

  test("POST /api/ai/taste-profile trả nhận định + top genres", async ({ page }) => {
    await login(page);
    const res = await page.request.post("/api/ai/taste-profile");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      provider: string;
      profileText: string;
      topGenres: unknown[];
    };
    expect(body.provider).toBe("mock");
    expect(body.profileText.length).toBeGreaterThan(0);
    expect(Array.isArray(body.topGenres)).toBe(true);
  });

  test("UI: trang chi tiết hiện panel đánh giá + lưu được", async ({ page }) => {
    await login(page);
    // Hidden Love (114479) nằm trong thư viện user seed -> panel hiển thị.
    await page.goto("/show/114479");
    await page.waitForLoadState("networkidle");
    const saveBtn = page.getByRole("button", { name: "Lưu đánh giá" });
    await expect(saveBtn).toBeVisible({ timeout: 15_000 });
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await expect(page.getByText("Đã lưu đánh giá.")).toBeVisible({ timeout: 10_000 });
  });
});
