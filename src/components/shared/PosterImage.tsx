import React, { useState } from "react";
import Image from "next/image";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface PosterImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
}

export function PosterImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw",
}: PosterImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Parse source path (if it's a TMDb relative path, prefix it, else use full path)
  const imageUrl = src
    ? src.startsWith("http") || src.startsWith("/images/")
      ? src
      : `https://image.tmdb.org/t/p/w500${src}`
    : null;

  return (
    <div
      className={cn(
        "relative w-full aspect-[2/3] bg-card border border-white/5 overflow-hidden rounded-lg select-none flex items-center justify-center",
        className,
      )}
    >
      {isLoading && <div className="absolute inset-0 skeleton-shimmer z-10" />}

      {imageUrl && !error ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          className={cn(
            "object-cover transition-transform duration-500 ease-out",
            isLoading ? "scale-105 blur-sm" : "scale-100 blur-0",
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
          priority={false}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-text-muted gap-2 p-3">
          <Film size={28} className="opacity-50" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-center line-clamp-2">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
}
