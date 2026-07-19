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
  const hasKnownTotal = total > 0;
  const percentage = hasKnownTotal ? Math.min(Math.round((current / total) * 100), 100) : 0;
  // Khi chưa biết tổng tập (TMDb không trả number_of_episodes) hiển thị "Tập X"
  // thay vì "Tập X/0" để tránh nhầm lẫn với "chưa xem tập nào".
  const label = hasKnownTotal ? `Tập ${current}/${total}` : `Tập ${current}`;

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
          <span>{label}</span>
          {hasKnownTotal && <span className="font-semibold text-accent">{percentage}%</span>}
        </div>
      )}
    </div>
  );
}
