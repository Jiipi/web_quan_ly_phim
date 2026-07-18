import { test, expect, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("Wiring dữ liệu thật", () => {
  test("library + watchlist hiển thị dữ liệu seed của user", async ({ page }) => {
    await login(page, "user@phimflow.com", "Password123!");

    await page.goto("/library");
    await expect(page.getByText("Vụng Trộm Không Thể Giấu").first()).toBeVisible();
    await expect(page.getByText("Người Dơi").first()).toBeVisible();

    await page.goto("/watchlist");
    // Batman là want_to_watch của user A.
    await expect(page.getByText("Người Dơi").first()).toBeVisible();
  });

  test("nút +1 tập trên continue-watching cập nhật tiến độ (toast)", async ({ page }) => {
    await login(page, "user@phimflow.com", "Password123!");

    await page.goto("/continue-watching");
    await expect(page.getByText("Vụng Trộm Không Thể Giấu").first()).toBeVisible();

    await page.getByRole("button", { name: "+1 Tập" }).first().click();
    await expect(page.getByText(/\+1 tập|Đã xem xong/).first()).toBeVisible({ timeout: 10_000 });
  });
});
