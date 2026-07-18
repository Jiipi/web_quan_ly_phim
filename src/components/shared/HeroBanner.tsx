"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export interface HeroBannerItem {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  originalTitle?: string;
  tagline?: string;
  overview?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  rating?: number;
  releaseDate?: string | null;
  genres?: string[];
  runtime?: number | null;
  status?: "watching" | "completed" | "want_to_watch" | "paused";
  currentEpisode?: number;
  totalEpisodes?: number;
}

interface HeroBannerProps {
  item: HeroBannerItem;
  className?: string;
  onPlay?: () => void;
  onAdd?: () => void;
}

const STATUS_LABEL = {
  watching: "Đang xem",
  completed: "Hoàn thành",
  want_to_watch: "Muốn xem",
  paused: "Tạm dừng",
} as const;

function detailHref(tmdbId: number, mediaType: "movie" | "tv"): string {
  return `/${mediaType === "tv" ? "show" : "movie"}/${tmdbId}`;
}

function getBackdropUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/images/")) return path;
  return `https://image.tmdb.org/t/p/w1280${path}`;
}

function getPosterUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/images/")) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

export function HeroBanner({ item, className, onPlay, onAdd }: HeroBannerProps) {
  const backdropUrl = getBackdropUrl(item.backdropPath);
  const posterUrl = getPosterUrl(item.posterPath);
  const year = item.releaseDate?.split("-")[0] ?? "";
  const progress =
    item.totalEpisodes && item.totalEpisodes > 0
      ? Math.min(100, Math.round(((item.currentEpisode || 0) / item.totalEpisodes) * 100))
      : 0;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/60",
        "min-h-[420px] sm:min-h-[480px] shadow-2xl",
        className,
      )}
    >
      {/* Backdrop image */}
      {backdropUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative h-full w-full"
          >
            <Image
              src={backdropUrl}
              alt={item.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </div>
      )}

      {/* Gradient overlays — 4 layers for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/10" />
      <div
        className="absolute inset-0 opacity-50 animate-hero-gradient"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, oklch(0.72 0.32 330 / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.7 0.32 290 / 0.25) 0%, transparent 50%)",
        }}
      />

      {/* Scanlines overlay (subtle CRT vibe) */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 2px, rgba(255,255,255,0.025) 3px, transparent 4px)",
        }}
      />

      {/* Corner HUD brackets */}
      <div
        className="absolute left-3 top-3 z-10 h-4 w-4 border-l-2 border-t-2 border-primary opacity-70"
        style={{ filter: "drop-shadow(0 0 4px oklch(0.72 0.32 330 / 0.7))" }}
      />
      <div
        className="absolute right-3 top-3 z-10 h-4 w-4 border-r-2 border-t-2 border-secondary opacity-70"
        style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.18 200 / 0.7))" }}
      />
      <div
        className="absolute left-3 bottom-3 z-10 h-4 w-4 border-b-2 border-l-2 border-secondary opacity-70"
        style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.18 200 / 0.7))" }}
      />
      <div
        className="absolute right-3 bottom-3 z-10 h-4 w-4 border-b-2 border-r-2 border-primary opacity-70"
        style={{ filter: "drop-shadow(0 0 4px oklch(0.72 0.32 330 / 0.7))" }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col gap-5 p-6 sm:p-8 md:flex-row md:items-end md:gap-8 md:p-10">
        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="hidden h-48 w-32 shrink-0 overflow-hidden rounded-xl border border-primary/50 shadow-[0_0_24px_oklch(0.72_0.32_330_/_0.45)] md:block lg:h-56 lg:w-36"
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={item.title}
              width={144}
              height={216}
              priority
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/30 to-secondary/30" />
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="flex flex-1 flex-col gap-3 md:gap-4"
        >
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            {item.status && (
              <Badge variant="default" className="uppercase">
                {STATUS_LABEL[item.status]}
              </Badge>
            )}
            {item.genres?.slice(0, 3).map((g) => (
              <Badge key={g} variant="outline" className="backdrop-blur-md bg-black/30">
                {g}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
              {item.title}
            </h2>
            {item.originalTitle && item.originalTitle !== item.title && (
              <p className="mt-1 text-sm font-medium text-white/60 sm:text-base">
                {item.originalTitle}
              </p>
            )}
          </div>

          {/* Tagline / Overview */}
          {item.overview && (
            <p className="line-clamp-2 max-w-2xl text-xs text-white/80 sm:text-sm md:line-clamp-3">
              {item.tagline || item.overview}
            </p>
          )}

          {/* Meta info row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
            {item.rating !== undefined && item.rating > 0 && (
              <span className="inline-flex items-center gap-1 font-mono font-bold">
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                {item.rating.toFixed(1)}
              </span>
            )}
            {year && <span>{year}</span>}
            {item.runtime && (
              <span>
                {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
              </span>
            )}
            <span className="font-semibold uppercase tracking-wider">
              {item.mediaType === "tv" ? "Phim bộ" : "Phim lẻ"}
            </span>
          </div>

          {/* Progress bar (only for TV shows being watched) */}
          {item.mediaType === "tv" &&
            item.totalEpisodes !== undefined &&
            item.totalEpisodes > 0 && (
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-1.5 flex-1 max-w-xs bg-white/10" />
                <span className="font-mono text-[10px] font-bold text-white/70">
                  Tập {item.currentEpisode || 0}/{item.totalEpisodes}
                </span>
              </div>
            )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button asChild size="lg" variant="default" className="px-7">
              <Link href={detailHref(item.tmdbId, item.mediaType)}>
                <Play className="h-4 w-4 fill-current" />
                Xem chi tiết
              </Link>
            </Button>
            {onPlay && (
              <Button size="lg" variant="secondary" onClick={onPlay}>
                <Play className="h-4 w-4" />
                Tiếp tục
              </Button>
            )}
            {onAdd && (
              <Button size="lg" variant="glass" onClick={onAdd}>
                <Plus className="h-4 w-4" />
                Thêm vào list
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom neon line */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary to-secondary"
        style={{ boxShadow: "0 0 12px oklch(0.72 0.32 330 / 0.7)" }}
      />
      {/* Top neon line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary to-primary"
        style={{ boxShadow: "0 0 12px oklch(0.85 0.18 200 / 0.7)" }}
      />
    </motion.section>
  );
}
