"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Play, AlertCircle, ArrowUpDown, RotateCw, BellPlus } from "lucide-react";
import { PosterImage } from "@/components/shared/PosterImage";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLibrary, type LibraryItem } from "@/lib/use-library";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { isForgotten } from "@/lib/reminders";

type SortMode = "recent" | "progress" | "forgotten";

function daysSince(date: string | null): number {
  if (!date) return 999;
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function ContinueWatchingPage() {
  const { items, loading, error, reload } = useLibrary();
  const { success, error: toastError } = useToast();
  const [sortBy, setSortBy] = useState<SortMode>("recent");
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Chỉ lấy phim đang xem dở (watching/paused).
  const inProgress = useMemo(
    () => items.filter((i) => i.status === "watching" || i.status === "paused"),
    [items],
  );

  const sorted = useMemo(() => {
    const list = [...inProgress];
    list.sort((a, b) => {
      if (sortBy === "progress") {
        return a.totalEpisodes - a.currentEpisode - (b.totalEpisodes - b.currentEpisode);
      }
      if (sortBy === "forgotten") {
        return daysSince(b.lastWatchedAt) - daysSince(a.lastWatchedAt);
      }
      return daysSince(a.lastWatchedAt) - daysSince(b.lastWatchedAt);
    });
    return list;
  }, [inProgress, sortBy]);

  async function handlePlusOne(item: LibraryItem) {
    setPendingId(item.id);
    const res = await api.post<{ currentEpisode: number; completed: boolean }>("/api/progress", {
      watchItemId: item.id,
    });
    setPendingId(null);
    if (res.success) {
      if (res.data?.completed) {
        success(`Đã xem xong "${item.mediaItem.title}"! 🎉`);
      } else {
        success(`+1 tập "${item.mediaItem.title}" (tập ${res.data?.currentEpisode}).`);
      }
      await reload();
    } else {
      toastError(res.error ?? "Không thể cập nhật tiến độ.");
    }
  }

  async function createReminder(item: LibraryItem) {
    const res = await api.post("/api/reminders", { watchItemId: item.id });
    if (res.success) success(`Đã tạo nhắc xem tiếp "${item.mediaItem.title}".`);
    else toastError(res.error ?? "Không thể tạo nhắc.");
  }

  return (
    <div className="flex animate-fade-in-up flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tiếp tục xem dở</h1>
          <p className="mt-1 text-xs text-text-secondary">
            Các phim bộ đang xem dở, xếp theo mức độ ưu tiên hoàn thành.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 p-1 text-xs font-semibold">
          <span className="flex items-center gap-1 px-2 text-[10px] uppercase tracking-wider text-text-muted">
            <ArrowUpDown size={10} />
            Sắp xếp:
          </span>
          {(
            [
              ["recent", "Vừa xem"],
              ["progress", "Sắp xong"],
              ["forgotten", "Bị bỏ quên"],
            ] as [SortMode, string][]
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setSortBy(mode)}
              aria-pressed={sortBy === mode}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                sortBy === mode ? "bg-primary text-white" : "text-text-secondary hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid gap-6 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-card flex gap-5 p-5">
              <div className="skeleton-shimmer h-36 w-24 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-3 py-1">
                <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                <div className="skeleton-shimmer h-3 w-1/2 rounded" />
                <div className="skeleton-shimmer mt-auto h-2 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-dropped">{error}</p>
          <button
            onClick={() => reload()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
          >
            <RotateCw size={14} /> Thử lại
          </button>
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <EmptyState
          title="Chưa có phim đang xem dở"
          description="Thêm phim vào thư viện và bắt đầu xem để theo dõi tiến độ tại đây."
          action={
            <Link
              href="/discover"
              className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover"
            >
              Khám phá phim
            </Link>
          }
        />
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {sorted.map((item) => {
            const inactive = daysSince(item.lastWatchedAt);
            const forgotten = isForgotten(item.lastWatchedAt);
            const remaining = Math.max(item.totalEpisodes - item.currentEpisode, 0);
            const reason = forgotten
              ? `Bị bỏ quên ${inactive} ngày`
              : item.totalEpisodes > 0 && remaining <= 6
                ? `Sắp hoàn thành (còn ${remaining} tập)`
                : "Đang xem dở";
            const isPending = pendingId === item.id;
            const atEnd = item.totalEpisodes > 0 && item.currentEpisode >= item.totalEpisodes;

            return (
              <div
                key={item.id}
                className={`glass-card group relative flex gap-5 overflow-hidden p-5 transition-all duration-300 ${
                  forgotten ? "border-dropped/20" : "border-white/8"
                }`}
              >
                <div className="w-24 shrink-0 overflow-hidden rounded-lg border border-white/8 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]">
                  <PosterImage src={item.mediaItem.posterPath} alt={item.mediaItem.title} />
                </div>

                <div className="z-10 flex min-w-0 flex-1 flex-col justify-between py-1">
                  <div>
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-bold text-text transition-colors group-hover:text-primary-light">
                        {item.mediaItem.title}
                      </h3>
                      <StatusBadge status={item.status === "paused" ? "paused" : "watching"} />
                    </div>
                    <p className="truncate text-[11px] text-text-muted">
                      {item.mediaItem.originalTitle}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 rounded-md border border-white/5 bg-white/3 px-2.5 py-1 text-[10px] font-medium">
                      {forgotten ? (
                        <AlertCircle size={12} className="shrink-0 text-dropped" />
                      ) : (
                        <Play size={10} className="shrink-0 text-accent" />
                      )}
                      <span
                        className={forgotten ? "font-semibold text-dropped" : "text-text-secondary"}
                      >
                        {reason}
                      </span>
                    </div>
                  </div>

                  <div className="my-4">
                    <ProgressBar current={item.currentEpisode} total={item.totalEpisodes} />
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-text-secondary">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                        Lần xem cuối
                      </span>
                      <span className="font-medium text-text">
                        {formatRelativeTime(item.lastWatchedAt)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {forgotten && (
                        <>
                          <button
                            onClick={() => createReminder(item)}
                            aria-label={`Nhắc xem tiếp ${item.mediaItem.title}`}
                            className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-text transition-all hover:bg-white/10"
                          >
                            <BellPlus size={12} /> Nhắc tôi
                          </button>
                          <Link
                            href={`/ai?tab=summary&show=${item.mediaItem.tmdbId}`}
                            className="rounded-md border border-white/8 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-text transition-all hover:bg-white/10"
                          >
                            AI Tóm tắt
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => handlePlusOne(item)}
                        disabled={isPending || atEnd}
                        className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[10px] font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover disabled:opacity-40"
                      >
                        {isPending ? "Đang lưu…" : "+1 Tập"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
