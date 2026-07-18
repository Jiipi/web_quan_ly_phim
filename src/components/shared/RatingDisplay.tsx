import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  score: number; // 0 to 10 scale
  className?: string;
  size?: "sm" | "md" | "lg";
  showStars?: boolean;
}

export function RatingDisplay({
  score,
  className,
  size = "sm",
  showStars = true,
}: RatingDisplayProps) {
  const roundedScore = Math.round(score * 10) / 10;

  // Calculate star count (scale to 5 stars)
  const starCount = Math.round((score / 2) * 2) / 2; // rounds to nearest 0.5
  const fullStars = Math.floor(starCount);
  const hasHalfStar = starCount % 1 !== 0;

  const starSize = size === "sm" ? 14 : size === "md" ? 18 : 22;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {showStars && (
        <div className="flex items-center text-secondary">
          {[...Array(5)].map((_, i) => {
            if (i < fullStars) {
              return <Star key={i} size={starSize} className="fill-current stroke-current" />;
            }
            if (i === fullStars && hasHalfStar) {
              return (
                <span key={i} className="relative inline-block text-secondary">
                  <Star size={starSize} className="stroke-current fill-none" />
                  <span
                    className="absolute top-0 left-0 overflow-hidden fill-current text-secondary"
                    style={{ width: "50%" }}
                  >
                    <Star size={starSize} className="fill-current stroke-current" />
                  </span>
                </span>
              );
            }
            return <Star key={i} size={starSize} className="stroke-current fill-none opacity-30" />;
          })}
        </div>
      )}
      <span
        className={cn(
          "font-mono font-bold text-secondary",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base",
        )}
      >
        {roundedScore.toFixed(1)}
      </span>
    </div>
  );
}
