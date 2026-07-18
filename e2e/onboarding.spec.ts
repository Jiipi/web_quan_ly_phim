import { test, expect, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("Onboarding", () => {
  test("user mới: đăng ký -> onboarding -> chọn gu -> dashboard", async ({ page }) => {
    const email = `onb_${Date.now()}@phimflow.com`;
    await page.goto("/register");
    await page.getByLabel("Tên hiển thị").fill("Onboarding Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mật khẩu", { exact: true }).fill("Password123!");
    await page.getByLabel("Nhập lại mật khẩu").fill("Password123!");
    await page.getByRole("button", { name: "Tạo tài khoản" }).click();

    await page.waitForURL("**/onboarding", { timeout: 15_000 });

    await page.getByRole("button", { name: "Romance" }).click();
    await page.getByRole("button", { name: "Việt Nam" }).click();
    await page.getByRole("button", { name: /Hoàn tất/ }).click();

    await page.waitForURL("**/dashboard", { timeout: 15_000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("user đã onboarding (seed) vào /onboarding -> chuyển thẳng /dashboard", async ({ page }) => {
    await login(page, "user@phimflow.com", "Password123!");
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
