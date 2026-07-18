import { test, expect, type Page } from "@playwright/test";

async function registerNewUser(page: Page) {
  const email = `ie_${Date.now()}@phimflow.com`;
  await page.goto("/register");
  await page.getByLabel("Tên hiển thị").fill("IE Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Password123!");
  await page.getByLabel("Nhập lại mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await page.waitForURL("**/onboarding", { timeout: 15_000 });
}

async function loginSeed(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@phimflow.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("Import / Export", () => {
  test("export -> xoá 1 phim -> import khôi phục", async ({ page }) => {
    await registerNewUser(page);

    await page.request.post("/api/library", {
      data: { tmdbId: 414906, mediaType: "movie", status: "watching" },
    });
    await page.request.post("/api/library", {
      data: { tmdbId: 196454, mediaType: "tv", status: "want_to_watch" },
    });

    const exportRes = await page.request.get("/api/export");
    expect(exportRes.status()).toBe(200);
    const backup = await exportRes.json();
    expect(backup.library.length).toBe(2);

    // Xoá 1 phim.
    const lib = (await (await page.request.get("/api/library")).json()) as Array<{ id: string }>;
    await page.request.delete(`/api/library?id=${lib[0].id}`);
    const afterDelete = (await (await page.request.get("/api/library")).json()) as unknown[];
    expect(afterDelete.length).toBe(1);

    // Import lại -> khôi phục đủ 2.
    const importRes = await page.request.post("/api/import", { data: backup });
    expect(importRes.status()).toBe(200);
    const restored = (await (await page.request.get("/api/library")).json()) as unknown[];
    expect(restored.length).toBe(2);
  });

  test("UI /settings lưu cài đặt + có nút xuất", async ({ page }) => {
    await loginSeed(page);
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Cài đặt hệ thống" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Xuất JSON/ })).toBeVisible();
    await page.getByRole("button", { name: "Lưu cài đặt" }).click();
    await expect(page.getByText("Đã lưu cài đặt.")).toBeVisible({ timeout: 10_000 });
  });

  test("UI /profile hiển thị email thật từ session", async ({ page }) => {
    await loginSeed(page);
    await page.goto("/profile");
    await expect(page.getByRole("main").getByText("user@phimflow.com").first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
