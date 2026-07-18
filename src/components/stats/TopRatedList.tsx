"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Play } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TopRatedItem {
  id: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  originalTitle?: string;
  posterPath?: string | null;
  rating: number;
  personalScore?: number | null;
  rank: number;
}

interface TopRatedListProps {
  items: TopRatedItem[];
  className?: string;
  emptyMessage?: string;
}

function getPosterUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/images/")) return path;
  return `https://image.tmdb.org/t/p/w200${path}`;
}

export function TopRatedList({
  items,
  className,
  emptyMessage = "Chưa có dữ liệu.",
}: TopRatedListProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card/40 p-8 text-center text-xs text-text-secondary",
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col divide-y divide-border rounded-2xl border border-border bg-card/40",
        className,
      )}
    >
      {items.map((item, idx) => {
        const posterUrl = getPosterUrl(item.posterPath);
        const href = `/${item.mediaType === "tv" ? "show" : "movie"}/${item.tmdbId}`;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
          >
            <Link
              href={href}
              className="flex items-center gap-3 p-3 transition-colors hover:bg-surface/60"
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-extrabold",
                  item.rank === 1
                    ? "bg-gradient-to-br from-secondary to-primary text-white shadow-[0_0_16px_oklch(0.82_0.16_75_/_0.5)]"
                    : item.rank === 2
                      ? "bg-secondary/30 text-secondary"
                      : item.rank === 3
                        ? "bg-secondary/20 text-secondary-hover"
                        : "bg-card text-text-muted",
                )}
              >
                #{item.rank}
              </div>
              <div className="h-10 w-7 shrink-0 overflow-hidden rounded bg-card">
                {posterUrl ? (
                  <Image
                    src={posterUrl}
                    alt={item.title}
                    width={28}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Play className="h-3 w-3 text-text-muted" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-bold">{item.title}</h4>
                {item.originalTitle && (
                  <p className="truncate text-[10px] text-text-muted">{item.originalTitle}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-secondary">
                  <Star className="h-3 w-3 fill-current" />
                  {item.rating.toFixed(1)}
                </div>
                {item.personalScore != null && item.personalScore > 0 && (
                  <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-primary">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    Bạn: {item.personalScore}
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
