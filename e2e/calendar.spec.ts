import { test, expect, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@phimflow.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("Calendar / Diary", () => {
  test("user mới: thêm phim + +1 -> xuất hiện trong nhật ký tháng này", async ({ page }) => {
    const email = `cal_${Date.now()}@phimflow.com`;
    await page.goto("/register");
    await page.getByLabel("Tên hiển thị").fill("Calendar Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mật khẩu", { exact: true }).fill("Password123!");
    await page.getByLabel("Nhập lại mật khẩu").fill("Password123!");
    await page.getByRole("button", { name: "Tạo tài khoản" }).click();
    await page.waitForURL("**/onboarding", { timeout: 15_000 });

    // Thêm 1 phim lẻ (The Batman) rồi đánh dấu đã xem -> tạo WatchSession hôm nay.
    const add = await page.request.post("/api/library", {
      data: { tmdbId: 414906, mediaType: "movie", status: "watching" },
    });
    const addBody = (await add.json()) as { watchItem: { id: string } };
    const watchItemId = addBody.watchItem.id;

    const prog = await page.request.post("/api/progress", {
      data: { watchItemId, episode: 1 },
    });
    expect(prog.status()).toBe(200);

    const cal = await page.request.get("/api/calendar");
    expect(cal.status()).toBe(200);
    const body = (await cal.json()) as { entries: Array<{ title: string }> };
    expect(body.entries.some((e) => e.title.includes("Dơi"))).toBe(true);
  });

  test("UI /calendar hiển thị lịch + điều hướng tháng", async ({ page }) => {
    await login(page);
    await page.goto("/calendar");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Lịch xem");
    await expect(page.getByRole("button", { name: "Tháng trước" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tháng sau" })).toBeVisible();
  });
});
