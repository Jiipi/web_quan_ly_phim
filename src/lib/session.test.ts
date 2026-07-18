import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @/lib/auth để không kéo theo NextAuth/Prisma vào môi trường test.
const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: authMock }));

import { getCurrentUserId } from "./session";

describe("getCurrentUserId", () => {
  beforeEach(() => authMock.mockReset());

  it("trả userId khi có session hợp lệ", async () => {
    authMock.mockResolvedValue({ user: { id: "u1" } });
    expect(await getCurrentUserId()).toBe("u1");
  });

  it("trả null khi không có session", async () => {
    authMock.mockResolvedValue(null);
    expect(await getCurrentUserId()).toBeNull();
  });

  it("trả null khi session thiếu user.id", async () => {
    authMock.mockResolvedValue({ user: {} });
    expect(await getCurrentUserId()).toBeNull();
  });
});
