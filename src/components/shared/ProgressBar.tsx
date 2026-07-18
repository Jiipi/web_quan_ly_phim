import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  showText?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  current,
  total,
  showText = true,
  className,
  size = "sm",
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      <div className="w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div
          className={cn(
            "h-1.5 rounded-full bg-gradient-to-r from-accent to-watching transition-all duration-500 ease-out",
            size === "sm" && "h-1.5",
            size === "md" && "h-2.5",
            size === "lg" && "h-4",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <div className="flex justify-between items-center text-[11px] text-text-secondary font-mono">
          <span>
            Tập {current}/{total}
          </span>
          <span className="font-semibold text-accent">{percentage}%</span>
        </div>
      )}
    </div>
  );
}
