"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Plus, Star, Tv, Film, Check, Clock } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type WatchStatus } from "@/components/shared/StatusBadge";

export interface Tag {
  tagId: string;
  tag: {
    id: string;
    name: string;
    color: string;
  };
}

const movieCardVariants = cva(
  "group relative overflow-hidden rounded-xl bg-card border border-border/60 transition-all duration-300 h-full",
  {
    variants: {
      variant: {
        grid: "hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_0_24px_oklch(0.72_0.32_330_/_0.35),0_8px_30px_oklch(0_0_0_/_0.4)]",
        compact:
          "hover:border-secondary/60 hover:-translate-y-0.5 hover:shadow-[0_0_16px_oklch(0.85_0.18_200_/_0.3)]",
        hero: "border-0 rounded-3xl shadow-[0_0_40px_oklch(0.72_0.32_330_/_0.3)]",
        list: "flex flex-row items-stretch hover:border-accent/60 hover:shadow-[0_0_16px_oklch(0.7_0.32_290_/_0.25)]",
      },
    },
    defaultVariants: {
      variant: "grid",
    },
  },
);

export interface MovieCardProps extends VariantProps<typeof movieCardVariants> {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  originalTitle?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  rating?: number;
  releaseDate?: string | null;
  genres?: string[];
  status?: WatchStatus;
  currentEpisode?: number;
  totalEpisodes?: number;
  showQuickActions?: boolean;
  priority?: boolean;
  layoutId?: string;
  className?: string;
  onAdd?: () => void;
  onPlay?: () => void;
  tags?: Tag[];
  showTags?: boolean;
  lastWatchedAt?: string | null;
}

const STATUS_LABEL: Record<WatchStatus, string> = {
  watching: "Đang xem",
  want_to_watch: "Muốn xem",
  completed: "Hoàn thành",
  paused: "Tạm dừng",
  dropped: "Bỏ dở",
  favorite: "Yêu thích",
};

const STATUS_CLASSES: Record<WatchStatus, string> = {
  watching: "bg-watching/20 text-watching border-watching/40",
  want_to_watch: "bg-want-to-watch/20 text-want-to-watch border-want-to-watch/40",
  completed: "bg-completed/20 text-completed border-completed/40",
  paused: "bg-paused/20 text-paused border-paused/40",
  dropped: "bg-dropped/20 text-dropped border-dropped/40",
  favorite: "bg-favorite/20 text-favorite border-favorite/40",
};

const STATUS_GLOW: Record<WatchStatus, string> = {
  watching: "shadow-[0_0_8px_oklch(0.82_0.2_200_/_0.55)]",
  want_to_watch: "shadow-[0_0_8px_oklch(0.75_0.3_290_/_0.55)]",
  completed: "shadow-[0_0_8px_oklch(0.82_0.22_145_/_0.55)]",
  paused: "shadow-[0_0_8px_oklch(0.85_0.2_75_/_0.55)]",
  dropped: "shadow-[0_0_8px_oklch(0.72_0.32_25_/_0.55)]",
  favorite: "shadow-[0_0_8px_oklch(0.78_0.32_20_/_0.55)]",
};

function detailHref(tmdbId: number, mediaType: "movie" | "tv"): string {
  return `/${mediaType === "tv" ? "show" : "movie"}/${tmdbId}`;
}

function getPosterUrl(posterPath?: string | null): string | null {
  if (!posterPath) return null;
  if (posterPath.startsWith("http") || posterPath.startsWith("/images/")) {
    return posterPath;
  }
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

function getYear(dateStr?: string | null): string {
  if (!dateStr) return "";
  return dateStr.split("-")[0];
}

export const MovieCard = React.forwardRef<HTMLDivElement, MovieCardProps>(
  (
    {
      className,
      variant,
      tmdbId,
      mediaType,
      title,
      originalTitle,
      posterPath,
      rating,
      releaseDate,
      status,
      currentEpisode,
      totalEpisodes,
      showQuickActions = false,
      priority = false,
      layoutId,
      onAdd,
      onPlay,
      tags,
      showTags = false,
      lastWatchedAt,
    },
    ref,
  ) => {
    const href = detailHref(tmdbId, mediaType);
    const posterUrl = getPosterUrl(posterPath);
    const year = getYear(releaseDate);
    const isTV = mediaType === "tv";
    const safeCurrent = currentEpisode ?? 0;
    const hasKnownTotal = totalEpisodes !== undefined && totalEpisodes > 0;
    const hasProgress = isTV && safeCurrent > 0;
    // Progress bar chỉ vẽ khi biết tổng số tập. Khi tổng = 0 (TMDb không trả về
    // `number_of_episodes`) ta không thể tính % nên ẩn bar để tránh thanh 0% gây hiểu lầm.
    const progress = hasKnownTotal
      ? Math.min(100, Math.round((safeCurrent / totalEpisodes) * 100))
      : 0;

    const Wrapper = layoutId ? motion.div : "div";
    const motionOnlyProps = layoutId ? { layoutId } : null;

    return (
      <Wrapper
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(movieCardVariants({ variant }), className)}
        {...(motionOnlyProps as Record<string, unknown>)}
      >
        <Link href={href} className="flex h-full flex-col" aria-label={`Xem chi tiết ${title}`}>
          {/* Poster */}
          <div className="relative aspect-[2/3] w-full overflow-hidden bg-card">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                priority={priority}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-card to-surface">
                {isTV ? (
                  <Tv className="h-12 w-12 text-text-muted opacity-40" />
                ) : (
                  <Film className="h-12 w-12 text-text-muted opacity-40" />
                )}
              </div>
            )}

            {/* Gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

            {/* Status badge top-left */}
            {status && (
              <Badge
                variant="outline"
                className={cn(
                  "absolute left-2 top-2 z-10 border backdrop-blur-md",
                  STATUS_CLASSES[status],
                  STATUS_GLOW[status],
                )}
              >
                {STATUS_LABEL[status]}
              </Badge>
            )}

            {/* Media type pill top-right */}
            <Badge
              variant="ghost"
              className="absolute right-2 top-2 z-10 border border-secondary/40 bg-secondary/10 font-mono text-[9px] uppercase tracking-wider text-secondary backdrop-blur-md"
            >
              {isTV ? "TV" : "Movie"}
            </Badge>

            {/* Hover actions */}
            {showQuickActions && (
              <div className="absolute bottom-2 left-2 right-2 z-10 flex translate-y-2 items-center gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPlay?.();
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_16px_oklch(0.72_0.32_330_/_0.7)] transition-transform hover:scale-110 active:scale-95"
                  aria-label="Phát"
                  title="Phát"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAdd?.();
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-secondary/60 bg-secondary/20 text-secondary backdrop-blur-md transition-all hover:scale-110 hover:shadow-[0_0_12px_oklch(0.85_0.18_200_/_0.5)] active:scale-95"
                  aria-label="Thêm vào danh sách"
                  title="Thêm"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Rating bottom-right */}
            {rating !== undefined && rating > 0 && (
              <div className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-md border border-secondary/40 bg-bg/80 px-2 py-0.5 font-mono text-[10px] font-bold text-secondary backdrop-blur-md">
                <Star className="h-3 w-3 fill-secondary text-secondary" />
                {rating.toFixed(1)}
              </div>
            )}

            {/* Neon border on hover */}
            <div
              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                boxShadow:
                  "inset 0 0 0 1px oklch(0.72 0.32 330 / 0.5), inset 0 0 16px oklch(0.72 0.32 330 / 0.2)",
              }}
            />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-1 p-3">
            <h3 className="line-clamp-1 text-xs font-bold text-text transition-all group-hover:text-primary group-hover:[text-shadow:0_0_8px_oklch(0.72_0.32_330_/_0.5)]">
              {title}
            </h3>
            {originalTitle && originalTitle !== title && (
              <p className="line-clamp-1 font-mono text-[10px] text-text-muted">{originalTitle}</p>
            )}
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-text-secondary">
              {year && <span>{year}</span>}
              {rating !== undefined && rating > 0 && variant !== "grid" && (
                <>
                  {year && <span>•</span>}
                  <span className="inline-flex items-center gap-0.5 font-mono text-secondary">
                    <Star className="h-2.5 w-2.5 fill-secondary text-secondary" />
                    {rating.toFixed(1)}
                  </span>
                </>
              )}
            </div>

            {/* Last watched hint — chỉ hiện khi có dữ liệu. */}
            {lastWatchedAt && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-text-muted",
                  variant === "grid" ? "text-[9px] font-mono" : "text-[10px] font-mono",
                )}
              >
                <Clock className={cn(variant === "grid" ? "h-2 w-2" : "h-2.5 w-2.5")} />
                <span>
                  {variant === "grid"
                    ? formatRelativeTime(lastWatchedAt)
                    : `Xem cách đây ${formatRelativeTime(lastWatchedAt)}`}
                </span>
              </div>
            )}

            {/* Episode info cho phim bộ — hiển thị đồng nhất với list/table.
                - Có tổng tập: thanh progress + "X/Y"
                - Chưa biết tổng (TMDb không trả number_of_episodes): chỉ hiện "Tập X"
                - Chưa xem tập nào (currentEpisode=0): không hiện để tránh rối */}
            {isTV && hasProgress && (
              <div className="mt-1.5 flex flex-col gap-1">
                {hasKnownTotal && <Progress value={progress} className="h-1" />}
                <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                  <span className="text-text-secondary">
                    {hasKnownTotal ? `Tập ${safeCurrent}/${totalEpisodes}` : `Tập ${safeCurrent}`}
                  </span>
                  {hasKnownTotal && safeCurrent >= totalEpisodes && (
                    <span className="inline-flex items-center gap-0.5 text-completed">
                      <Check className="h-2.5 w-2.5" /> xong
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tags display */}
            {showTags && tags && tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {tags.slice(0, 3).map((mt) => (
                  <span
                    key={mt.tagId}
                    className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-medium"
                    style={{
                      backgroundColor: `${mt.tag.color}20`,
                      color: mt.tag.color,
                    }}
                  >
                    {mt.tag.name}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-[8px] text-text-muted">+{tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </Link>
      </Wrapper>
    );
  },
);
MovieCard.displayName = "MovieCard";

export { movieCardVariants };
