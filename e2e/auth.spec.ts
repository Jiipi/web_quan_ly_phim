import { test, expect } from "@playwright/test";

const SEEDED_EMAIL = "user@phimflow.com";
const SEEDED_PASSWORD = "Password123!";

test.describe("Xác thực", () => {
  test("đăng nhập tài khoản seed -> vào dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(SEEDED_EMAIL);
    await page.getByLabel("Mật khẩu").fill(SEEDED_PASSWORD);
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await page.waitForURL("**/dashboard", { timeout: 15_000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("mật khẩu sai -> hiện lỗi, ở lại trang login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(SEEDED_EMAIL);
    await page.getByLabel("Mật khẩu").fill("sai-mat-khau");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page.getByText(/Email hoặc mật khẩu không đúng/i)).toBeVisible();
    expect(page.url()).toContain("/login");
  });

  test("đăng ký tài khoản mới -> tự đăng nhập -> dashboard", async ({ page }) => {
    const email = `e2e_${Date.now()}@phimflow.com`;
    await page.goto("/register");
    await page.getByLabel("Tên hiển thị").fill("E2E Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mật khẩu", { exact: true }).fill("Password123!");
    await page.getByLabel("Nhập lại mật khẩu").fill("Password123!");
    await page.getByRole("button", { name: "Tạo tài khoản" }).click();

    // User mới được đưa qua onboarding trước.
    await page.waitForURL("**/onboarding", { timeout: 15_000 });
    expect(page.url()).toContain("/onboarding");
  });
});
