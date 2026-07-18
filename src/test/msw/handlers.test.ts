import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "./server";

describe("MSW harness", () => {
  it("mock /api/tmdb/search theo query mặc định", async () => {
    const res = await fetch("http://localhost/api/tmdb/search?q=batman");
    const data = (await res.json()) as Array<{ originalTitle: string }>;
    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].originalTitle).toBe("The Batman");
  });

  it("cho phép override handler trong từng test", async () => {
    server.use(
      http.get("*/api/library", () => HttpResponse.json([{ id: "x1", title: "Test Item" }])),
    );
    const res = await fetch("http://localhost/api/library");
    const data = (await res.json()) as Array<{ title: string }>;
    expect(data[0].title).toBe("Test Item");
  });
});
