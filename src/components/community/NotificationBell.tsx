"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Sparkles, Users, MessageCircle, Heart } from "lucide-react";
import { api } from "@/lib/api";
import { usePoll } from "@/lib/use-poll";
import { useToast } from "@/components/ui/toast";
import { timeAgo } from "@/lib/community";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { NotificationItem, NotificationListResponse } from "./types";

/**
 * Bell icon + dropdown. Tự đóng khi click ngoài. Polling mỗi 15s.
 */
export function NotificationBell() {
  const { error: toastError } = useToast();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Polling nhẹ 15s cho cả bell (chỉ update unreadCount nếu dropdown đóng)
  usePoll({
    fn: async () => {
      const res = await api.get<NotificationListResponse>("/api/notifications", {
        limit: 30,
      });
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount);
        if (open) {
          setItems(res.data.notifications);
        }
      }
    },
    intervalMs: 15000,
  });

  // Click outside để đóng
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Khi mở → fetch full list
  async function fetchItems() {
    const res = await api.get<NotificationListResponse>("/api/notifications", {
      limit: 30,
    });
    if (!res.success) {
      toastError(res.error ?? "Không thể tải thông báo.");
      return;
    }
    setItems(res.data?.notifications ?? []);
    setUnreadCount(res.data?.unreadCount ?? 0);
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) void fetchItems();
  }

  async function markAllRead() {
    const res = await api.patch("/api/notifications", { all: true });
    if (!res.success) {
      toastError(res.error ?? "Không thể cập nhật.");
      return;
    }
    setItems((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    setUnreadCount(0);
  }

  async function markOneRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await api.patch("/api/notifications", { ids: [id] });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Thông báo"
        title="Thông báo"
        className="relative rounded-md border border-transparent p-2 text-text-secondary transition-all hover:border-accent/50 hover:bg-accent/10 hover:text-accent"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary pulse-glow" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-xl border border-primary/40 bg-bg/95 backdrop-blur-xl z-50 animate-fade-in-up dark:shadow-[0_0_24px_var(--neon-pink-soft)]">
          <div className="flex items-center justify-between border-b border-primary/20 px-3.5 py-2.5">
            <span className="font-mono text-xs font-bold text-text uppercase tracking-wider">
              Thông báo
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="font-mono text-[9px] font-bold uppercase tracking-wider text-secondary hover:text-secondary-hover transition-colors"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto py-1 divide-y divide-primary/10">
            {items.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                Không có thông báo nào.
              </div>
            ) : (
              items.map((n) => (
                <NotificationRow
                  key={n.id}
                  n={n}
                  onClick={() => {
                    if (!n.readAt) markOneRead(n.id);
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ n, onClick }: { n: NotificationItem; onClick: () => void }) {
  let Icon: typeof Bell = Bell;
  let iconColor = "text-text-muted bg-surface/50 border-border";
  let message = "";
  if (n.kind === "post.like") {
    Icon = Heart;
    iconColor =
      "text-primary bg-primary/15 border-primary/30 dark:shadow-[0_0_8px_var(--neon-pink-soft)]";
    message = `${n.actor.name ?? "Ai đó"} đã thích bài viết của bạn`;
  } else if (n.kind === "post.comment") {
    Icon = MessageCircle;
    iconColor =
      "text-accent bg-accent/15 border-accent/30 dark:shadow-[0_0_8px_var(--neon-violet-soft)]";
    message = `${n.actor.name ?? "Ai đó"} đã bình luận vào bài viết của bạn`;
  } else if (n.kind === "user.follow") {
    Icon = Users;
    iconColor =
      "text-secondary bg-secondary/15 border-secondary/30 dark:shadow-[0_0_8px_var(--neon-cyan-soft)]";
    message = `${n.actor.name ?? "Ai đó"} đã bắt đầu theo dõi bạn`;
  } else {
    Icon = Sparkles;
    message = "Có hoạt động mới";
  }

  const href =
    n.kind === "user.follow" && n.actor.handle
      ? `/u/${n.actor.handle}`
      : n.postId
        ? `/community/post/${n.postId}`
        : "#";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex gap-3 px-3.5 py-3 transition-colors text-left relative",
        n.readAt ? "hover:bg-white/5" : "bg-primary/5 hover:bg-primary/10",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs",
          iconColor,
        )}
      >
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <p
            className={cn("text-xs font-bold truncate", n.readAt ? "text-white/90" : "text-white")}
          >
            {message}
          </p>
          {!n.readAt && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
        </div>
        <span className="mt-1.5 block font-mono text-[9px] text-text-muted">
          {timeAgo(new Date(n.createdAt))}
        </span>
      </div>
    </Link>
  );
}
