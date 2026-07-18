import React from "react";
import { cn } from "@/lib/utils";

export type WatchStatus =
  | "want_to_watch"
  | "watching"
  | "paused"
  | "completed"
  | "dropped"
  | "favorite";

interface StatusBadgeProps {
  status: WatchStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const statusMap: Record<
  WatchStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  watching: {
    label: "Đang xem",
    bgClass: "bg-watching/10",
    textClass: "text-watching",
    borderClass: "border-watching/20",
  },
  completed: {
    label: "Đã xong",
    bgClass: "bg-completed/10",
    textClass: "text-completed",
    borderClass: "border-completed/20",
  },
  paused: {
    label: "Tạm dừng",
    bgClass: "bg-paused/10",
    textClass: "text-paused",
    borderClass: "border-paused/20",
  },
  dropped: {
    label: "Bỏ ngang",
    bgClass: "bg-dropped/10",
    textClass: "text-dropped",
    borderClass: "border-dropped/20",
  },
  want_to_watch: {
    label: "Muốn xem",
    bgClass: "bg-want-to-watch/10",
    textClass: "text-want-to-watch",
    borderClass: "border-want-to-watch/20",
  },
  favorite: {
    label: "Yêu thích",
    bgClass: "bg-favorite/10",
    textClass: "text-favorite",
    borderClass: "border-favorite/20",
  },
};

export function StatusBadge({ status, className, size = "sm" }: StatusBadgeProps) {
  const config = statusMap[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-mono font-semibold rounded-full border transition-all duration-150",
        config.bgClass,
        config.textClass,
        config.borderClass,
        size === "sm" && "text-[11px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        size === "lg" && "text-sm px-3.5 py-1.5",
        className,
      )}
    >
      {config.label}
    </span>
  );
}
