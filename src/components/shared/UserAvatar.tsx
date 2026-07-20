"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZE_MAP = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
} as const;

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: keyof typeof SIZE_MAP;
  className?: string;
  /** Show a glowing ring around the avatar */
  glow?: boolean;
}

/**
 * Reusable avatar component — shows user image or fallback initial letter.
 * Used in header, settings, admin panels, etc.
 */
export function UserAvatar({
  src,
  name = "U",
  size = "md",
  className,
  glow = false,
}: UserAvatarProps) {
  const initial = (name || "U").charAt(0).toUpperCase();
  const sizeClass = SIZE_MAP[size];

  if (src) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border-2 border-primary/40",
          sizeClass,
          glow && "shadow-[0_0_16px_oklch(0.72_0.32_330_/_0.5)]",
          className,
        )}
      >
        <Image
          src={src}
          alt={`Avatar của ${name}`}
          fill
          sizes="96px"
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/15 font-bold text-primary",
        sizeClass,
        glow && "shadow-[0_0_16px_oklch(0.72_0.32_330_/_0.5)]",
        className,
      )}
    >
      {initial}
    </div>
  );
}
