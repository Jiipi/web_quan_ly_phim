import { describe, it, expect } from "vitest";
import {
  createListSchema,
  updateListSchema,
  addListItemSchema,
  reorderListSchema,
} from "./list-schema";

describe("createListSchema", () => {
  it("chấp nhận name hợp lệ", () => {
    expect(createListSchema.safeParse({ name: "Phim cuối tuần" }).success).toBe(true);
    expect(
      createListSchema.safeParse({ name: "A", description: "mô tả", isPublic: true }).success,
    ).toBe(true);
  });
  it("từ chối name rỗng / quá dài", () => {
    expect(createListSchema.safeParse({ name: "" }).success).toBe(false);
    expect(createListSchema.safeParse({ name: "x".repeat(81) }).success).toBe(false);
  });
});

describe("updateListSchema", () => {
  it("chấp nhận cập nhật một phần", () => {
    expect(updateListSchema.safeParse({ isPublic: true }).success).toBe(true);
    expect(updateListSchema.safeParse({ name: "Mới" }).success).toBe(true);
  });
  it("từ chối object rỗng", () => {
    expect(updateListSchema.safeParse({}).success).toBe(false);
  });
});

describe("addListItemSchema / reorderListSchema", () => {
  it("add cần mediaItemId", () => {
    expect(addListItemSchema.safeParse({ mediaItemId: "m1" }).success).toBe(true);
    expect(addListItemSchema.safeParse({}).success).toBe(false);
  });
  it("reorder cần mảng không rỗng", () => {
    expect(reorderListSchema.safeParse({ orderedMediaItemIds: ["a", "b"] }).success).toBe(true);
    expect(reorderListSchema.safeParse({ orderedMediaItemIds: [] }).success).toBe(false);
  });
});
