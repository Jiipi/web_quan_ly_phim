"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ListPlus, Play, Trash2, RotateCw } from "lucide-react";
import { PosterImage } from "@/components/shared/PosterImage";
import { RatingDisplay } from "@/components/shared/RatingDisplay";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLibrary, type LibraryItem } from "@/lib/use-library";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { api } from "@/lib/api";

type PriorityLevel = "high" | "medium" | "low";

const PRIORITY_VALUE: Record<PriorityLevel, number> = { high: 10, medium: 5, low: 1 };

function levelFromPriority(p: number): PriorityLevel {
  if (p >= 8) return "high";
  if (p >= 3) return "medium";
  return "low";
}

const PRIORITY_META: Record<PriorityLevel, { label: string; badge: string }> = {
  high: { label: "Rất muốn xem", badge: "bg-dropped/10 text-dropped border-dropped/25" },
  medium: { label: "Xem sau", badge: "bg-paused/10 text-paused border-paused/25" },
  low: {
    label: "Khi rảnh",
    badge: "bg-want-to-watch/10 text-want-to-watch border-want-to-watch/25",
  },
};

export default function WatchlistPage() {
  const { items, loading, error, reload } = useLibrary();
  const watchlistItems = useMemo(
    () => items.filter((it) => it.status === "want_to_watch"),
    [items],
  );
  const { success, error: toastError } = useToast();
  const { confirm } = useConfirm();
  const [selectedPriority, setSelectedPriority] = useState<"all" | PriorityLevel>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      watchlistItems.filter(
        (item) =>
          selectedPriority === "all" || levelFromPriority(item.priority) === selectedPriority,
      ),
    [watchlistItems, selectedPriority],
  );

  async function handleStartWatching(item: LibraryItem) {
    setPendingId(item.id);
    const res = await api.patch("/api/library", { watchItemId: item.id, status: "watching" });
    setPendingId(null);
    if (res.success) {
      success(`Bắt đầu xem "${item.mediaItem.title}".`);
      await reload();
    } else {
      toastError(res.error ?? "Không thể cập nhật trạng thái.");
    }
  }

  async function handleRemove(item: LibraryItem) {
    const ok = await confirm({
      title: "Xoá khỏi watchlist?",
      message: `"${item.mediaItem.title}" sẽ bị xoá khỏi danh sách muốn xem.`,
      confirmLabel: "Xoá",
      danger: true,
    });
    if (!ok) return;
    const res = await api.delete(`/api/library?id=${encodeURIComponent(item.id)}`);
    if (res.success) {
      success(`Đã xoá "${item.mediaItem.title}".`);
      await reload();
    } else {
      toastError(res.error ?? "Không thể xoá phim.");
    }
  }

  async function handlePriorityChange(item: LibraryItem, level: PriorityLevel) {
    const res = await api.patch("/api/library", {
      watchItemId: item.id,
      priority: PRIORITY_VALUE[level],
    });
    if (res.success) {
      success("Đã cập nhật mức ưu tiên.");
      await reload();
    } else {
      toastError(res.error ?? "Không thể cập nhật ưu tiên.");
    }
  }

  return (
    <div className="flex animate-fade-in-up flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Danh sách muốn xem</h1>
          <p className="mt-1 text-xs text-text-secondary">
            Quản lý và ưu tiên các bộ phim bạn muốn xem trong tương lai.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/3 p-1 text-xs font-semibold">
          {(
            [
              ["all", "Tất cả"],
              ["high", "Rất muốn xem"],
              ["medium", "Xem sau"],
              ["low", "Khi rảnh"],
            ] as ["all" | PriorityLevel, string][]
          ).map(([level, label]) => (
            <button
              key={level}
              onClick={() => setSelectedPriority(level)}
              aria-pressed={selectedPriority === level}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                selectedPriority === level
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass-card flex items-center gap-4 p-4">
              <div className="skeleton-shimmer h-24 w-16 shrink-0 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="skeleton-shimmer h-4 w-1/3 rounded" />
                <div className="skeleton-shimmer h-3 w-1/2 rounded" />
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

      {!loading && !error && watchlistItems.length === 0 && (
        <EmptyState
          icon={<ListPlus size={28} />}
          title="Watchlist trống"
          description="Thêm phim bạn muốn xem để lên kế hoạch và ưu tiên cho lần xem tới."
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

      {!loading && !error && watchlistItems.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ListPlus className="mb-4 text-text-muted opacity-55" size={40} />
          <h4 className="mb-1 text-sm font-bold">Không có phim</h4>
          <p className="max-w-xs text-xs leading-relaxed text-text-secondary">
            Không có phim nào khớp với mức độ ưu tiên đã chọn.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-4">
          {filtered.map((item) => {
            const level = levelFromPriority(item.priority);
            const meta = PRIORITY_META[level];
            const isPending = pendingId === item.id;
            return (
              <div
                key={item.id}
                className="glass-card group flex flex-col items-start justify-between gap-4 p-4 transition-colors hover:bg-white/5 sm:flex-row sm:items-center"
              >
                <div className="flex w-full min-w-0 items-center gap-4 sm:w-auto">
                  <div className="w-16 shrink-0 overflow-hidden rounded-md border border-white/5 shadow-md">
                    <PosterImage src={item.mediaItem.posterPath} alt={item.mediaItem.title} />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-text transition-colors group-hover:text-primary-light">
                        {item.mediaItem.title}
                      </h3>
                      <span
                        className={`rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mb-2 truncate text-[11px] text-text-muted">
                      {item.mediaItem.originalTitle} • {item.mediaItem.genres.join(", ")}
                    </p>
                    {item.notes && (
                      <p className="line-clamp-2 text-[11px] italic leading-relaxed text-text-secondary">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex w-full shrink-0 items-center justify-between gap-4 border-t border-white/5 pt-3 sm:mt-0 sm:w-auto sm:justify-end sm:border-t-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-text-muted">TMDb</span>
                    <RatingDisplay score={item.mediaItem.tmdbRating} showStars={false} size="sm" />
                  </div>

                  <div className="flex flex-col gap-1 text-[10px] text-text-muted">
                    <label htmlFor={`prio-${item.id}`}>Ưu tiên</label>
                    <select
                      id={`prio-${item.id}`}
                      value={level}
                      onChange={(e) => handlePriorityChange(item, e.target.value as PriorityLevel)}
                      className="rounded border border-white/8 bg-card p-1.5 text-xs text-text focus:outline-none"
                    >
                      <option value="high">Rất muốn xem</option>
                      <option value="medium">Xem sau</option>
                      <option value="low">Khi rảnh</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartWatching(item)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-[10px] font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover disabled:opacity-50"
                      title="Bắt đầu xem"
                    >
                      <Play size={10} className="fill-current" />
                      {isPending ? "…" : "Xem"}
                    </button>
                    <button
                      onClick={() => handleRemove(item)}
                      aria-label={`Xoá ${item.mediaItem.title} khỏi watchlist`}
                      className="rounded-md border border-white/8 bg-white/5 p-2 text-text-secondary transition-all hover:border-dropped/20 hover:bg-dropped/10 hover:text-dropped"
                      title="Xoá khỏi watchlist"
                    >
                      <Trash2 size={12} />
                    </button>
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
