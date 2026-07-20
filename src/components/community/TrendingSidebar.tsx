"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TrendingUp, Film, Loader2, Star } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { TrendingMovie } from "./types";

interface TrendingSidebarProps {
  /** Currently selected movie filter (null = no filter) */
  activeMovieId?: number | null;
  /** Callback when user clicks a movie to filter */
  onSelectMovie?: (tmdbId: number | null) => void;
}

export function TrendingSidebar({ activeMovieId, onSelectMovie }: TrendingSidebarProps) {
  const [trending, setTrending] = useState<TrendingMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ trending: TrendingMovie[] }>("/api/community/trending").then((res) => {
      if (res.success && res.data) {
        setTrending(res.data.trending);
      }
      setLoading(false);
    });
  }, []);

  return (
    <aside className="glass-card sticky top-20 flex flex-col gap-3 p-4">
      <h3 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-secondary">
        <TrendingUp size={12} />
        Phim đang hot tuần này
      </h3>

      {loading && (
        <div className="flex items-center justify-center py-6 text-white/40">
          <Loader2 size={16} className="animate-spin" />
        </div>
      )}

      {!loading && trending.length === 0 && (
        <p className="py-4 text-center text-[10px] text-white/40">
          Chưa có phim nào được thảo luận tuần này.
        </p>
      )}

      {trending.map((m) => {
        const isActive = activeMovieId === m.tmdbId;
        return (
          <button
            key={m.tmdbId}
            type="button"
            onClick={() => onSelectMovie?.(isActive ? null : m.tmdbId)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg p-2 text-left transition-all",
              isActive ? "border border-primary/40 bg-primary/15" : "hover:bg-white/5",
            )}
          >
            <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-surface">
              {m.poster ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w92${m.poster}`}
                  alt={m.title}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-primary">
                  <Film size={14} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-white">{m.title}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="font-mono text-[9px] text-white/50">{m.postCount} bài viết</span>
                {m.avgRating && (
                  <span className="flex items-center gap-0.5 font-mono text-[9px] text-yellow-400">
                    <Star size={8} className="fill-current" />
                    {m.avgRating}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </aside>
  );
}
