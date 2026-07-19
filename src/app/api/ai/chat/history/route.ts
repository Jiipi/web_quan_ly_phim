import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * GET /api/ai/chat/history
 * - No params → list all sessions (title + updatedAt)
 * - ?sessionId=xxx → list messages of that session
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get("sessionId");

    if (sessionId) {
      // Return messages for a specific session
      const session = await db.chatSession.findFirst({
        where: { id: sessionId, userId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            select: { id: true, role: true, content: true, createdAt: true },
          },
        },
      });

      if (!session) {
        return NextResponse.json({ error: "Không tìm thấy phiên chat." }, { status: 404 });
      }

      return NextResponse.json({
        session: {
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
        },
        messages: session.messages,
      });
    }

    // Return list of sessions
    const sessions = await db.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ sessions });
  } catch (err: unknown) {
    console.error("Chat History GET Error:", err);
    return NextResponse.json({ error: "Không thể tải lịch sử chat." }, { status: 500 });
  }
}

/**
 * DELETE /api/ai/chat/history?sessionId=xxx
 * Delete a chat session and all its messages.
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Yêu cầu đăng nhập." }, { status: 401 });
    }

    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "Thiếu sessionId." }, { status: 400 });
    }

    // Verify ownership
    const session = await db.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return NextResponse.json({ error: "Không tìm thấy phiên chat." }, { status: 404 });
    }

    await db.chatSession.delete({ where: { id: sessionId } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Chat History DELETE Error:", err);
    return NextResponse.json({ error: "Không thể xoá phiên chat." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
