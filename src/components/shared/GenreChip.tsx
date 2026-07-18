"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GenreChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  count?: number;
}

export function GenreChip({ label, active, onClick, className, count }: GenreChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_16px_oklch(0.68_0.22_18_/_0.5)]"
          : "border-border bg-surface/60 text-text-secondary backdrop-blur-md hover:border-border-hover hover:bg-surface hover:text-text",
        className,
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[9px] font-mono",
            active ? "bg-white/20" : "bg-white/5 text-text-muted",
          )}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}

interface GenreChipRowProps {
  items: Array<{ id: string | number; label: string; count?: number }>;
  activeId?: string | number | "all";
  onSelect?: (id: string | number) => void;
  className?: string;
  showAll?: boolean;
  allLabel?: string;
}

export function GenreChipRow({
  items,
  activeId = "all",
  onSelect,
  className,
  showAll = true,
  allLabel = "Tất cả",
}: GenreChipRowProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2 scrollbar-hide", className)}>
      {showAll && (
        <GenreChip label={allLabel} active={activeId === "all"} onClick={() => onSelect?.("all")} />
      )}
      {items.map((item) => (
        <GenreChip
          key={item.id}
          label={item.label}
          count={item.count}
          active={activeId === item.id}
          onClick={() => onSelect?.(item.id)}
        />
      ))}
    </div>
  );
}
