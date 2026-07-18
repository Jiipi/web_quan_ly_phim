import { test, expect, type Page } from "@playwright/test";

async function registerNewUser(page: Page) {
  const email = `list_${Date.now()}@phimflow.com`;
  await page.goto("/register");
  await page.getByLabel("Tên hiển thị").fill("List Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Password123!");
  await page.getByLabel("Nhập lại mật khẩu").fill("Password123!");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await page.waitForURL("**/onboarding", { timeout: 15_000 });
}

test.describe("Lists (CRUD)", () => {
  test("tạo list -> thêm 2 phim -> đổi thứ tự -> gỡ 1", async ({ page }) => {
    await registerNewUser(page);

    const addMedia = async (tmdbId: number, mediaType: string) => {
      const res = await page.request.post("/api/library", {
        data: { tmdbId, mediaType, status: "want_to_watch" },
      });
      return ((await res.json()) as { watchItem: { mediaItemId: string } }).watchItem.mediaItemId;
    };
    const m1 = await addMedia(414906, "movie"); // Người Dơi
    const m2 = await addMedia(196454, "tv"); // Chiếc Bật Lửa

    const created = await page.request.post("/api/lists", {
      data: { name: `E2E List ${Date.now()}` },
    });
    expect(created.status()).toBe(201);
    const listId = ((await created.json()) as { list: { id: string } }).list.id;

    expect(
      (
        await page.request.post(`/api/lists/${listId}/items`, { data: { mediaItemId: m1 } })
      ).status(),
    ).toBe(201);
    expect(
      (
        await page.request.post(`/api/lists/${listId}/items`, { data: { mediaItemId: m2 } })
      ).status(),
    ).toBe(201);

    let detail = (await (await page.request.get(`/api/lists/${listId}`)).json()) as {
      items: { mediaItemId: string }[];
    };
    expect(detail.items.length).toBe(2);

    // Đổi thứ tự -> m2 lên đầu.
    await page.request.patch(`/api/lists/${listId}/items`, {
      data: { orderedMediaItemIds: [m2, m1] },
    });
    detail = (await (await page.request.get(`/api/lists/${listId}`)).json()) as {
      items: { mediaItemId: string }[];
    };
    expect(detail.items[0].mediaItemId).toBe(m2);

    // Gỡ 1 phim.
    await page.request.delete(`/api/lists/${listId}/items?mediaItemId=${m1}`);
    detail = (await (await page.request.get(`/api/lists/${listId}`)).json()) as {
      items: { mediaItemId: string }[];
    };
    expect(detail.items.length).toBe(1);
  });

  test("UI /lists hiển thị danh sách seed", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("user@phimflow.com");
    await page.getByLabel("Mật khẩu").fill("Password123!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await page.waitForURL("**/dashboard", { timeout: 15_000 });

    await page.goto("/lists");
    await expect(page.getByRole("heading", { name: "Danh sách của tôi" })).toBeVisible();
    await expect(page.getByText("Ngôn tình cày cuối tuần")).toBeVisible({ timeout: 10_000 });
  });
});
