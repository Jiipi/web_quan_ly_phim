import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { ratingSchema } from "@/lib/rating-schema";
import { findOwnedWatchItem } from "@/lib/watch-item-access";
import { flattenFieldErrors } from "@/lib/auth-schemas";

// Lấy đánh giá của user cho một watchItem.
export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

  const watchItemId = new URL(req.url).searchParams.get("watchItemId");
  if (!watchItemId) return NextResponse.json({ error: "Thiếu watchItemId." }, { status: 400 });

  const rating = await db.rating.findUnique({
    where: { userId_watchItemId: { userId, watchItemId } },
  });
  return NextResponse.json(rating);
}

// Tạo/cập nhật đánh giá (upsert theo user+watchItem) + đồng bộ personalScore.
export async function PUT(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const parsed = ratingSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const { watchItemId, ...scores } = parsed.data;
    if (!(await findOwnedWatchItem(userId, watchItemId))) {
      return NextResponse.json({ error: "Không tìm thấy phim." }, { status: 404 });
    }

    const rating = await db.rating.upsert({
      where: { userId_watchItemId: { userId, watchItemId } },
      update: scores,
      create: { userId, watchItemId, ...scores },
    });

    // Đồng bộ điểm tổng vào WatchItem để hiển thị ở thư viện/thẻ.
    await db.watchItem.update({
      where: { id: watchItemId },
      data: { personalScore: parsed.data.overallScore },
    });

    return NextResponse.json({ success: true, rating });
  } catch (err: unknown) {
    console.error("Ratings PUT Route Error:", err);
    return NextResponse.json({ error: "Không thể lưu đánh giá." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
