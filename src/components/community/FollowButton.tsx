"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { UserPlus, UserCheck } from "lucide-react";

interface FollowButtonProps {
  handle: string;
  initialFollowing: boolean;
  initialFollowersCount: number;
  isMe: boolean;
  className?: string;
  /** Khi toggle xong (vd để refresh parent) */
  onChange?: (following: boolean) => void;
}

/**
 * Button toggle follow/unfollow với optimistic update + confirm dialog khi unfollow.
 */
export function FollowButton({
  handle,
  initialFollowing,
  initialFollowersCount,
  isMe,
  className,
  onChange,
}: FollowButtonProps) {
  const { error: toastError, success } = useToast();
  const { confirm } = useConfirm();
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialFollowersCount);
  const [busy, setBusy] = useState(false);

  if (isMe) {
    return (
      <span
        className={cn(
          "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40",
          className,
        )}
      >
        Đây là bạn
      </span>
    );
  }

  async function toggle() {
    if (busy) return;
    if (following) {
      const ok = await confirm({
        title: "Bỏ theo dõi?",
        message: `Bỏ theo dõi người dùng này?`,
        confirmLabel: "Bỏ theo dõi",
        danger: true,
      });
      if (!ok) return;
    }

    const prev = following;
    setFollowing(!prev);
    setCount((c) => c + (prev ? -1 : 1));
    setBusy(true);

    const res = await api.post<{ following: boolean }>(`/api/users/${handle}/follow`);
    setBusy(false);

    if (!res.success) {
      // rollback
      setFollowing(prev);
      setCount((c) => c + (prev ? 1 : -1));
      toastError(res.error ?? "Không thể theo dõi.");
      return;
    }
    setFollowing(res.data?.following ?? !prev);
    onChange?.(res.data?.following ?? !prev);
    if (res.data?.following && !prev) success("Đã theo dõi.");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={following}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
        following
          ? "border-secondary/40 bg-secondary/10 text-secondary hover:border-dropped/40 hover:bg-dropped/10 hover:text-dropped"
          : "border-primary/40 bg-primary/15 text-primary hover:bg-primary hover:text-white",
        busy && "opacity-60",
        className,
      )}
    >
      {following ? <UserCheck size={12} /> : <UserPlus size={12} />}
      {following ? `Đang theo dõi · ${count}` : "Theo dõi"}
    </button>
  );
}
