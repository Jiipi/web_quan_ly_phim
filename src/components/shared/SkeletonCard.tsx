import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  hasDetails?: boolean;
}

export function SkeletonCard({ className, hasDetails = true }: SkeletonCardProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-lg overflow-hidden w-full", className)}>
      {/* Poster Aspect Ratio 2:3 container */}
      <div className="relative aspect-[2/3] w-full rounded-lg skeleton-shimmer overflow-hidden border border-white/5" />

      {hasDetails && (
        <div className="flex flex-col gap-2 px-1">
          {/* Title line */}
          <div className="h-4 w-3/4 rounded skeleton-shimmer" />
          {/* Metadata line */}
          <div className="h-3 w-1/2 rounded skeleton-shimmer opacity-75" />
          {/* Bottom rating line */}
          <div className="h-3 w-1/4 rounded skeleton-shimmer opacity-50" />
        </div>
      )}
    </div>
  );
}

export function SkeletonGrid({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6",
        className,
      )}
    >
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
