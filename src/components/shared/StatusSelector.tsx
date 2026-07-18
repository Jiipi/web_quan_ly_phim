"use client";

import * as React from "react";
import { Play, ListPlus, Star, Pause, X, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type WatchStatus } from "@/components/shared/StatusBadge";

interface StatusSelectorProps {
  value: WatchStatus;
  onChange: (value: WatchStatus) => void;
  className?: string;
}

const OPTIONS: Array<{
  value: WatchStatus;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { value: "watching", label: "Đang xem", Icon: Play },
  { value: "want_to_watch", label: "Muốn xem", Icon: ListPlus },
  { value: "completed", label: "Hoàn thành", Icon: Star },
  { value: "paused", label: "Tạm dừng", Icon: Pause },
  { value: "dropped", label: "Bỏ dở", Icon: X },
  { value: "favorite", label: "Yêu thích", Icon: Heart },
];

export function StatusSelector({ value, onChange, className }: StatusSelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-2 rounded-2xl border border-border bg-card/60 p-2 backdrop-blur-md",
        className,
      )}
      role="radiogroup"
      aria-label="Chọn trạng thái"
    >
      {OPTIONS.map(({ value: optVal, label, Icon }) => {
        const active = optVal === value;
        return (
          <motion.button
            key={optVal}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(optVal)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_oklch(0.68_0.22_18_/_0.45)]"
                : "text-text-secondary hover:bg-surface hover:text-text",
            )}
          >
            <Icon size={14} className={active ? "fill-current" : ""} />
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}
