import { test, expect, type Page } from "@playwright/test";

async function registerNewUser(page: Page) {
  const email = `rem_${Date.now()}@phimflow.com`;
  await page.goto("/register");
  await page.getByLabel("Tên hiển thị").fill("Reminder Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Password123!");
  await page.getByLabel("Nhập lại mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await page.waitForURL("**/onboarding", { timeout: 15_000 });
}

test.describe("Reminders", () => {
  test("tạo nhắc -> GET đọc được -> xoá", async ({ page }) => {
    await registerNewUser(page);

    const add = await page.request.post("/api/library", {
      data: { tmdbId: 196454, mediaType: "tv", status: "watching" },
    });
    const watchItemId = ((await add.json()) as { watchItem: { id: string } }).watchItem.id;

    const create = await page.request.post("/api/reminders", { data: { watchItemId } });
    expect(create.status()).toBe(201);

    const list = await page.request.get("/api/reminders");
    expect(list.status()).toBe(200);
    const body = (await list.json()) as {
      reminders: Array<{ id: string; watchItemId: string }>;
      forgotten: unknown[];
    };
    expect(Array.isArray(body.forgotten)).toBe(true);
    const reminder = body.reminders.find((r) => r.watchItemId === watchItemId);
    expect(reminder).toBeTruthy();

    const del = await page.request.delete(`/api/reminders?id=${reminder!.id}`);
    expect(del.status()).toBe(200);

    const after = await page.request.get("/api/reminders");
    const afterBody = (await after.json()) as { reminders: Array<{ id: string }> };
    expect(afterBody.reminders.find((r) => r.id === reminder!.id)).toBeUndefined();
  });

  test("GET /api/reminders không đăng nhập -> 401", async ({ request }) => {
    const res = await request.get("/api/reminders");
    expect(res.status()).toBe(401);
  });
});
