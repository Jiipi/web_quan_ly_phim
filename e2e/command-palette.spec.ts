import { test, expect, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@phimflow.com");
  await page.getByLabel("Mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("Command palette (Ctrl+K)", () => {
  test("Ctrl+K mở palette và điều hướng tới trang", async ({ page }) => {
    await login(page);
    // Đợi topbar (cùng layout với handler Ctrl+K) mount xong trước khi bấm phím.
    await expect(page.getByRole("button", { name: "Mở tìm kiếm nhanh" }).first()).toBeVisible();
    await page.keyboard.press("Control+k");

    const input = page.getByPlaceholder(/Tìm trang/);
    await expect(input).toBeVisible({ timeout: 10_000 });

    await input.fill("Watchlist");
    await input.press("Enter");
    await page.waitForURL("**/watchlist", { timeout: 10_000 });
  });

  test("nút tìm kiếm trên topbar mở palette", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Mở tìm kiếm nhanh" }).first().click();
    await expect(page.getByPlaceholder(/Tìm trang/)).toBeVisible({ timeout: 10_000 });

    // Escape đóng palette.
    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder(/Tìm trang/)).toHaveCount(0);
  });
});
