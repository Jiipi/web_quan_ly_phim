import { test, expect } from "@playwright/test";

test.describe("Landing page (smoke)", () => {
  test("trang chủ tải được và hiển thị thương hiệu + CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/PhimFlow/);
    await expect(page.getByRole("heading", { name: /Quản Lý Toàn Bộ Hành Trình/i })).toBeVisible();
    // Khách chưa đăng nhập -> CTA header là "Đăng nhập".
    await expect(page.getByRole("link", { name: /Đăng nhập/i })).toBeVisible();
  });
});
