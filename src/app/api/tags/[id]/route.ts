import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";

// PATCH - Cập nhật tag
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { id } = await params;
    const { name, color } = await req.json();

    const existing = await db.tag.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Tag không tồn tại." }, { status: 404 });
    }

    const tag = await db.tag.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
      },
    });

    return NextResponse.json({ success: true, tag });
  } catch (err: unknown) {
    console.error("Tags PATCH Error:", err);
    return NextResponse.json({ error: "Không thể cập nhật tag." }, { status: 500 });
  }
}

// DELETE - Xóa tag
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });

    const { id } = await params;

    const existing = await db.tag.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Tag không tồn tại." }, { status: 404 });
    }

    await db.tag.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Tags DELETE Error:", err);
    return NextResponse.json({ error: "Không thể xóa tag." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
