import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/rating-schema";
import { findOwnedWatchItem } from "@/lib/watch-item-access";
import { flattenFieldErrors } from "@/lib/auth-schemas";

// Lấy review của user cho một watchItem.
export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

  const watchItemId = new URL(req.url).searchParams.get("watchItemId");
  if (!watchItemId) return NextResponse.json({ error: "Thiếu watchItemId." }, { status: 400 });

  const review = await db.review.findUnique({
    where: { userId_watchItemId: { userId, watchItemId } },
  });
  return NextResponse.json(review);
}

// Tạo/cập nhật review (upsert theo user+watchItem).
export async function PUT(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const { watchItemId, content, spoilers } = parsed.data;
    if (!(await findOwnedWatchItem(userId, watchItemId))) {
      return NextResponse.json({ error: "Không tìm thấy phim." }, { status: 404 });
    }

    const review = await db.review.upsert({
      where: { userId_watchItemId: { userId, watchItemId } },
      update: { content, spoilers: spoilers ?? false },
      create: { userId, watchItemId, content, spoilers: spoilers ?? false },
    });

    return NextResponse.json({ success: true, review });
  } catch (err: unknown) {
    console.error("Reviews PUT Route Error:", err);
    return NextResponse.json({ error: "Không thể lưu review." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
