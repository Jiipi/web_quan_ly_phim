import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai";
import type { AIChatMessage } from "@/lib/ai/types";
import { enforceRateLimit } from "@/lib/api-guard";
import { logAudit, clientIp } from "@/lib/audit";

const bodySchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
});

/**
 * Build system prompt with user context for personalised movie consultation.
 */
async function buildSystemPrompt(userId: string): Promise<string> {
  const [pref, items] = await Promise.all([
    db.userPreference.findUnique({ where: { userId } }),
    db.watchItem.findMany({
      where: { userId },
      include: { mediaItem: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

  const favGenres = pref?.favGenres?.join(", ") || "đa dạng";
  const favCountries = pref?.favCountries?.join(", ") || "đa dạng";
  const libraryTitles =
    items.map((i) => `${i.mediaItem.title} (${i.status})`).join(", ") || "chưa có";
  const watchingNow = items
    .filter((i) => i.status === "watching")
    .map((i) => i.mediaItem.title)
    .join(", ");

  return (
    `Bạn là CineBot — trợ lý AI tư vấn phim của CineOS. ` +
    `Quy tắc bắt buộc:\n` +
    `1. Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (tối đa 300 từ).\n` +
    `2. TUYỆT ĐỐI KHÔNG spoil nội dung, twist, kết phim.\n` +
    `3. Khi gợi ý phim, ưu tiên theo gu user: thể loại [${favGenres}], quốc gia [${favCountries}].\n` +
    `4. Thư viện hiện tại của user: ${libraryTitles}.\n` +
    (watchingNow ? `5. User đang xem: ${watchingNow}.\n` : "") +
    `6. Khi gợi ý, đề xuất 2-3 phim kèm lý do ngắn gọn.\n` +
    `7. Nếu chưa rõ nhu cầu, hãy hỏi lại user.\n` +
    `8. Có thể dùng emoji phù hợp để trả lời sinh động hơn.\n` +
    `9. Không trả lời các câu hỏi không liên quan đến phim/giải trí.`
  );
}

/**
 * POST /api/ai/chat — Streaming chat endpoint.
 * Body: { sessionId?: string, message: string }
 * Response: text/event-stream
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Yêu cầu đăng nhập." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const limited = enforceRateLimit(`ai-chat:${userId}`, 30, 60_000);
    if (limited) return limited;

    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Dữ liệu không hợp lệ." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { sessionId, message } = parsed.data;

    // Create or load session
    type SessionWithMessages = Prisma.ChatSessionGetPayload<{
      include: { messages: true };
    }>;

    let session: SessionWithMessages | null = null;
    if (sessionId) {
      session = (await db.chatSession.findFirst({
        where: { id: sessionId, userId },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
      })) as SessionWithMessages | null;
    }

    if (!session) {
      session = (await db.chatSession.create({
        data: {
          userId,
          title: message.slice(0, 80),
        },
        include: { messages: true },
      })) as SessionWithMessages;
    }

    // Build conversation history from saved messages
    const history: AIChatMessage[] = (session.messages ?? []).map((m) => ({
      role: m.role as AIChatMessage["role"],
      content: m.content,
    }));
    history.push({ role: "user", content: message });

    // Save user message
    await db.chatMessage.create({
      data: { chatSessionId: session.id, role: "user", content: message },
    });

    // Build system prompt with user context
    const systemPrompt = await buildSystemPrompt(userId);

    // Get AI provider and stream
    const provider = getAIProvider();
    const stream = await provider.chat({ messages: history, systemPrompt });

    // Collect full response while streaming to client
    let fullResponse = "";

    const responseStream = new TransformStream<string, string>();
    const writer = responseStream.writable.getWriter();

    // Process stream in background
    const streamPromise = (async () => {
      try {
        const reader = stream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += value;
          await writer.write(value);
        }
      } finally {
        await writer.close();
        // Save assistant response after stream completes
        await db.chatMessage.create({
          data: {
            chatSessionId: session.id,
            role: "assistant",
            content: fullResponse,
          },
        });
        // Update session title if it was just created (only 1 user message)
        if (!sessionId) {
          await db.chatSession.update({
            where: { id: session.id },
            data: { title: message.slice(0, 80) },
          });
        }
        await logAudit(userId, "ai.chat", { sessionId: session.id }, clientIp(req));
      }
    })();

    // Don't await streamPromise — let it run in background
    void streamPromise;

    return new Response(responseStream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Chat-Session-Id": session.id,
      },
    });
  } catch (err: unknown) {
    console.error("AI Chat Route Error:", err);
    return new Response(JSON.stringify({ error: "Không thể xử lý tin nhắn." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const dynamic = "force-dynamic";
