"use client";

import { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { api } from "@/lib/api";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { usePoll } from "@/lib/use-poll";
import { timeAgo } from "@/lib/community";
import type { CommentItem, CommentListResponse } from "./types";

interface CommentListProps {
  postId: string;
  /** Trigger để tăng/giảm counter trên parent post card khi cần */
  onCountChange?: (delta: number) => void;
}

export function CommentList({ postId, onCountChange }: CommentListProps) {
  const { data: session } = useSession();
  const { confirm } = useConfirm();
  const { error: toastError, success } = useToast();
  const meId = session?.user?.id;
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    api.get<CommentListResponse>(`/api/community/posts/${postId}/comments`).then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        setComments(res.data.comments);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [postId]);

  // Poll để cập nhật khi người khác comment (mỗi 8s)
  usePoll({
    fn: async () => {
      const res = await api.get<CommentListResponse>(`/api/community/posts/${postId}/comments`, {
        limit: 100,
      });
      if (res.success && res.data) {
        setComments((prev) => {
          // Nếu số lượng khác hoặc id cuối khác → cập nhật
          if (
            prev.length !== res.data!.comments.length ||
            prev[prev.length - 1]?.id !== res.data!.comments[res.data!.comments.length - 1]?.id
          ) {
            return res.data!.comments;
          }
          return prev;
        });
      }
    },
    intervalMs: 8000,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    const res = await api.post<{ success: true; comment: CommentItem }>(
      `/api/community/posts/${postId}/comments`,
      { content: trimmed },
    );
    setSubmitting(false);
    if (!res.success || !res.data) {
      toastError(res.error ?? "Không thể gửi bình luận.");
      return;
    }
    setComments((prev) => [...prev, res.data!.comment]);
    setContent("");
    onCountChange?.(1);
    success("Đã gửi bình luận.");
  }

  async function handleDelete(c: CommentItem) {
    const ok = await confirm({
      title: "Xoá bình luận?",
      message: "Không thể hoàn tác.",
      danger: true,
      confirmLabel: "Xoá",
    });
    if (!ok) return;
    const res = await api.delete(`/api/community/comments/${c.id}`);
    if (!res.success) {
      toastError(res.error ?? "Không thể xoá.");
      return;
    }
    setComments((prev) => prev.filter((x) => x.id !== c.id));
    onCountChange?.(-1);
    success("Đã xoá bình luận.");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <UserAvatar src={session?.user?.image} name={session?.user?.name ?? "Bạn"} size="sm" />
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết bình luận..."
          maxLength={2000}
          className="flex-1 rounded-full border border-white/10 bg-bg/40 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting ? <Loader2 size={12} className="animate-spin" /> : "Gửi"}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-white/40">
          <Loader2 size={16} className="animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-xs text-white/40">Chưa có bình luận.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => {
            const isMine = c.authorId === meId;
            const profileHref = c.author.handle ? `/u/${c.author.handle}` : "#";
            return (
              <li key={c.id} className="flex gap-2">
                <Link href={profileHref} className="shrink-0">
                  <UserAvatar src={c.author.image} name={c.author.name ?? "U"} size="sm" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-3 py-2">
                    <Link
                      href={profileHref}
                      className="text-xs font-bold text-white hover:text-primary"
                    >
                      {c.author.name ?? "Người dùng"}
                      {c.author.handle && (
                        <span className="ml-1 font-mono text-[9px] font-normal text-white/40">
                          @{c.author.handle}
                        </span>
                      )}
                    </Link>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-xs text-white/90">
                      {c.content}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-3 px-1">
                    <span className="font-mono text-[10px] text-white/40">
                      {timeAgo(new Date(c.createdAt))}
                    </span>
                    {isMine && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        aria-label="Xoá bình luận"
                        className="rounded p-0.5 text-white/40 transition-colors hover:bg-white/5 hover:text-dropped"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
