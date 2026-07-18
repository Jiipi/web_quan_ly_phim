import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { DEFAULT_TOPICS } from "@/lib/topics";

// GET - Lấy danh sách topics mặc định + topics tùy chỉnh của user
export async function GET() {
  const userId = await getCurrentUserId();
  
  // Lấy topics tùy chỉnh của user (nếu có)
  let customTopics: Array<{ id: string; name: string; color: string }> = [];
  if (userId) {
    const tags = await db.tag.findMany({
      where: { userId },
      select: { id: true, name: true, color: true },
    });
    customTopics = tags;
  }

  // Merge: predefined topics + user topics
  const allTopics = [
    ...DEFAULT_TOPICS.map((t) => ({
      id: t.name.toLowerCase().replace(/\s+/g, "-"),
      name: t.name,
      color: t.color,
      icon: t.icon,
      description: t.description,
      isCustom: false,
    })),
    ...customTopics.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      icon: "🏷️",
      description: "Tag tùy chỉnh",
      isCustom: true,
    })),
  ];

  return NextResponse.json(allTopics);
}

// POST - Gán topic vào phim (dùng cho predefined topics)
// Body: { watchItemId, topicName }
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { watchItemId, topicName } = await req.json();

    if (!watchItemId || !topicName) {
      return NextResponse.json({ error: "Thiếu watchItemId hoặc topicName." }, { status: 400 });
    }

    // Kiểm tra watchItem thuộc về user
    const watchItem = await db.watchItem.findUnique({ where: { id: watchItemId } });
    if (!watchItem || watchItem.userId !== userId) {
      return NextResponse.json({ error: "Phim không tồn tại." }, { status: 404 });
    }

    // Tìm hoặc tạo tag với topicName
    let tag = await db.tag.findUnique({
      where: { userId_name: { userId, name: topicName } },
    });

    if (!tag) {
      // Tạo tag mới cho topic
      tag = await db.tag.create({
        data: {
          userId,
          name: topicName,
          color: "#7C3AED", // Default color
        },
      });
    }

    // Tạo mediaTag (ignore if exists)
    await db.mediaTag.upsert({
      where: {
        watchItemId_tagId: { watchItemId, tagId: tag.id },
      },
      create: { watchItemId, tagId: tag.id },
      update: {},
    });

    return NextResponse.json({ success: true, tag });
  } catch (err: unknown) {
    console.error("Topics POST Error:", err);
    return NextResponse.json({ error: "Không thể gán topic." }, { status: 500 });
  }
}

// DELETE - Xóa topic khỏi phim
export async function DELETE(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { watchItemId, topicName } = await req.json().catch(() => ({}));

    if (!watchItemId || !topicName) {
      return NextResponse.json({ error: "Thiếu watchItemId hoặc topicName." }, { status: 400 });
    }

    // Kiểm tra watchItem thuộc về user
    const watchItem = await db.watchItem.findUnique({ where: { id: watchItemId } });
    if (!watchItem || watchItem.userId !== userId) {
      return NextResponse.json({ error: "Phim không tồn tại." }, { status: 404 });
    }

    // Tìm tag
    const tag = await db.tag.findUnique({
      where: { userId_name: { userId, name: topicName } },
    });

    if (tag) {
      await db.mediaTag.deleteMany({
        where: { watchItemId, tagId: tag.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Topics DELETE Error:", err);
    return NextResponse.json({ error: "Không thể xóa topic." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
