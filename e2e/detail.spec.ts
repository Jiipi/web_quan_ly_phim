import { test, expect, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("Trang chi tiết", () => {
  test("show: hiển thị chi tiết + episode grid + đánh dấu tập", async ({ page }) => {
    await login(page, "user@phimflow.com", "Password123!");

    // Hidden Love (114479) nằm trong thư viện user A, đang xem -> có episode grid.
    await page.goto("/show/114479");
    await expect(page.getByRole("heading", { name: "Vụng Trộm Không Thể Giấu" })).toBeVisible();
    await expect(page.getByText("Tiến độ tập").first()).toBeVisible();

    await page.getByRole("button", { name: "Đánh dấu đã xem tới tập 15" }).click();
    await expect(page.getByText(/Đã cập nhật tới tập 15|Đã xem xong/).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("movie: user mới thêm phim vào thư viện từ trang chi tiết", async ({ page }) => {
    // Đăng ký user mới (thư viện trống) để nút 'Thêm vào thư viện' luôn xuất hiện.
    const email = `detail_${Date.now()}@phimflow.com`;
    await page.goto("/register");
    await page.getByLabel("Tên hiển thị").fill("Detail Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mật khẩu", { exact: true }).fill("Password123!");
    await page.getByLabel("Nhập lại mật khẩu").fill("Password123!");
    await page.getByRole("button", { name: "Tạo tài khoản" }).click();
    await page.waitForURL("**/onboarding", { timeout: 15_000 });

    await page.goto("/movie/414906"); // The Batman
    await expect(page.getByRole("heading", { name: "Người Dơi" })).toBeVisible();

    await page.getByRole("button", { name: /Thêm vào thư viện/ }).click();
    await expect(page.getByText(/Đã thêm/).first()).toBeVisible({ timeout: 10_000 });
  });
});
