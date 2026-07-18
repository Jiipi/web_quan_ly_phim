"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 14, gap: "gap-0.5", text: "text-xs" },
  md: { icon: 18, gap: "gap-1", text: "text-sm" },
  lg: { icon: 24, gap: "gap-1.5", text: "text-base" },
} as const;

export function RatingStars({
  value,
  onChange,
  max = 10,
  size = "md",
  readonly = false,
  showValue = false,
  className,
}: RatingStarsProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const dims = SIZE_MAP[size];
  const displayValue = hoverValue ?? value;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className={cn("inline-flex", dims.gap)} role={readonly ? undefined : "radiogroup"}>
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          const filled = starValue <= displayValue;
          const half = !filled && starValue - 0.5 <= displayValue;
          return (
            <button
              key={i}
              type="button"
              disabled={readonly}
              onMouseEnter={() => !readonly && setHoverValue(starValue)}
              onMouseLeave={() => !readonly && setHoverValue(null)}
              onClick={() => !readonly && onChange?.(starValue === value ? 0 : starValue)}
              aria-label={`${starValue} điểm`}
              aria-pressed={starValue === value}
              className={cn(
                "transition-transform duration-150",
                !readonly && "hover:scale-110 active:scale-95 cursor-pointer",
                readonly && "cursor-default",
              )}
            >
              <motion.span
                key={`${starValue}-${filled}-${half}`}
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                className="inline-flex"
              >
                <Star
                  size={dims.icon}
                  className={cn(
                    "transition-colors",
                    filled
                      ? "fill-secondary text-secondary"
                      : half
                        ? "fill-secondary/40 text-secondary"
                        : "fill-transparent text-text-muted/40",
                  )}
                />
              </motion.span>
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className={cn("font-mono font-bold text-text", dims.text)}>
          {displayValue}/{max}
        </span>
      )}
    </div>
  );
}
