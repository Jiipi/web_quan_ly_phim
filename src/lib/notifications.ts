import { db } from "./db";

export type NotificationKind = "post.like" | "post.comment" | "user.follow";

interface NotifyInput {
  recipientId: string;
  actorId: string;
  kind: NotificationKind;
  postId?: string | null;
  commentId?: string | null;
}

/**
 * Tạo một notification mới. Skip nếu actor = recipient (không tự notify mình).
 * Fire-and-forget — nuốt lỗi để không chặn request chính.
 */
export async function notify(input: NotifyInput): Promise<void> {
  if (input.actorId === input.recipientId) return;
  try {
    await db.notification.create({
      data: {
        recipientId: input.recipientId,
        actorId: input.actorId,
        kind: input.kind,
        postId: input.postId ?? null,
        commentId: input.commentId ?? null,
      },
    });
  } catch (err) {
    console.error("[notify] failed:", err);
  }
}
