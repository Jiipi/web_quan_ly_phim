import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";

// POST - Gán tag vào phim
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { watchItemId, tagId } = await req.json();

    if (!watchItemId || !tagId) {
      return NextResponse.json({ error: "Thiếu watchItemId hoặc tagId." }, { status: 400 });
    }

    // Kiểm tra watchItem thuộc về user
    const watchItem = await db.watchItem.findUnique({
      where: { id: watchItemId },
    });
    if (!watchItem || watchItem.userId !== userId) {
      return NextResponse.json({ error: "Phim không tồn tại." }, { status: 404 });
    }

    // Kiểm tra tag thuộc về user
    const tag = await db.tag.findUnique({ where: { id: tagId } });
    if (!tag || tag.userId !== userId) {
      return NextResponse.json({ error: "Tag không tồn tại." }, { status: 404 });
    }

    // Tạo mediaTag (ignore if exists)
    const mediaTag = await db.mediaTag.upsert({
      where: {
        watchItemId_tagId: { watchItemId, tagId },
      },
      create: { watchItemId, tagId },
      update: {},
    });

    return NextResponse.json({ success: true, mediaTag });
  } catch (err: unknown) {
    console.error("MediaTags POST Error:", err);
    return NextResponse.json({ error: "Không thể gán tag." }, { status: 500 });
  }
}

// DELETE - Xóa tag khỏi phim
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { watchItemId, tagId } = await req.json().catch(() => ({}));

    if (!watchItemId || !tagId) {
      return NextResponse.json({ error: "Thiếu watchItemId hoặc tagId." }, { status: 400 });
    }

    // Kiểm tra watchItem thuộc về user
    const watchItem = await db.watchItem.findUnique({
      where: { id: watchItemId },
    });
    if (!watchItem || watchItem.userId !== userId) {
      return NextResponse.json({ error: "Phim không tồn tại." }, { status: 404 });
    }

    await db.mediaTag.deleteMany({
      where: { watchItemId, tagId },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("MediaTags DELETE Error:", err);
    return NextResponse.json({ error: "Không thể xóa tag." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
