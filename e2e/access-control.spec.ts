import { test, expect, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15_000 });
}

test.describe("Kiểm soát truy cập", () => {
  test("chưa đăng nhập vào /dashboard -> bị chuyển sang /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("API /api/library không session -> 401", async ({ request }) => {
    const res = await request.get("/api/library");
    expect(res.status()).toBe(401);
  });

  test("cô lập dữ liệu: user A chỉ thấy phim của mình", async ({ page }) => {
    await login(page, "user@phimflow.com", "Password123!");

    const res = await page.request.get("/api/library");
    expect(res.status()).toBe(200);

    const items = (await res.json()) as Array<{ mediaItem: { title: string } }>;
    const titles = items.map((i) => i.mediaItem.title).join(" | ");

    expect(titles).toContain("Vụng Trộm"); // Hidden Love -> của user A
    expect(titles).not.toContain("Chiếc Bật Lửa"); // Lighter -> chỉ thuộc user B
  });
});
