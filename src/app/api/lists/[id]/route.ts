import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { updateListSchema } from "@/lib/list-schema";
import { flattenFieldErrors } from "@/lib/auth-schemas";

type Ctx = { params: Promise<{ id: string }> };

// Chi tiết danh sách + phim bên trong. Cho phép chủ sở hữu HOẶC list công khai.
export async function GET(_req: NextRequest, { params }: Ctx) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

  const { id } = await params;
  const list = await db.customList.findUnique({
    where: { id },
    include: {
      items: {
        include: { mediaItem: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!list || (list.userId !== userId && !list.isPublic)) {
    return NextResponse.json({ error: "Không tìm thấy danh sách." }, { status: 404 });
  }

  return NextResponse.json({
    id: list.id,
    name: list.name,
    description: list.description,
    isPublic: list.isPublic,
    isOwner: list.userId === userId,
    items: list.items.map((it) => ({
      mediaItemId: it.mediaItemId,
      position: it.position,
      tmdbId: it.mediaItem.tmdbId,
      title: it.mediaItem.title,
      mediaType: it.mediaItem.mediaType,
      posterPath: it.mediaItem.posterPath,
    })),
  });
}

// Cập nhật (tên/mô tả/công khai). Chỉ chủ sở hữu.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { id } = await params;
    const existing = await db.customList.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Không tìm thấy danh sách." }, { status: 404 });
    }

    const parsed = updateListSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fieldErrors: flattenFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const list = await db.customList.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ success: true, list });
  } catch (err: unknown) {
    console.error("Lists PATCH Route Error:", err);
    return NextResponse.json({ error: "Không thể cập nhật danh sách." }, { status: 500 });
  }
}

// Xoá danh sách (cascade ListItem). Chỉ chủ sở hữu.
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { id } = await params;
    const existing = await db.customList.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Không tìm thấy danh sách." }, { status: 404 });
    }

    await db.customList.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Lists DELETE Route Error:", err);
    return NextResponse.json({ error: "Không thể xoá danh sách." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
