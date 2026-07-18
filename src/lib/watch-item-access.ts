import { db } from "@/lib/db";

/** Trả về WatchItem nếu thuộc về user, ngược lại null (dùng cho ownership check). */
export async function findOwnedWatchItem(userId: string, watchItemId: string) {
  const wi = await db.watchItem.findUnique({ where: { id: watchItemId } });
  return wi && wi.userId === userId ? wi : null;
}
