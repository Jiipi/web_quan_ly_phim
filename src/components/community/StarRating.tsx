"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  className?: string;
}

/**
 * Interactive or readonly star rating component (1-5 stars).
 */
export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 16,
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value ?? 0;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star === value ? 0 : star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(null)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
          )}
          aria-label={`${star} sao`}
        >
          <Star
            size={size}
            className={cn(
              "transition-colors",
              star <= display
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-white/20",
            )}
          />
        </button>
      ))}
      {value && value > 0 && (
        <span className="ml-1 font-mono text-[10px] text-yellow-400/80">{value}/5</span>
      )}
    </div>
  );
}
