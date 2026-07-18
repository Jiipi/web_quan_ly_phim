"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Play, PlayCircle, Check, Star } from "lucide-react";
import type { MediaDetail, DetailInitial } from "@/lib/media-detail";
import { PosterImage } from "@/components/shared/PosterImage";
import { StatusBadge, type WatchStatus } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RatingReviewPanel } from "@/components/detail/RatingReviewPanel";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { countryLabel, STATUS_OPTIONS } from "@/lib/labels";
import { TagAssignment } from "@/components/tags/TagAssignment";

export function DetailView({ detail, initial }: { detail: MediaDetail; initial: DetailInitial }) {
  const { success, error: toastError } = useToast();
  const isTv = detail.mediaType === "tv";
  const total = detail.numberOfEpisodes;

  const [inLibrary, setInLibrary] = useState(initial.inLibrary);
  const [watchItemId, setWatchItemId] = useState(initial.watchItemId);
  const [status, setStatus] = useState<WatchStatus>(
    (initial.status as WatchStatus | null) ?? "want_to_watch",
  );
  const [currentEpisode, setCurrentEpisode] = useState(initial.currentEpisode);
  const [currentMinute, setCurrentMinute] = useState(initial.currentMinute);
  const [busy, setBusy] = useState(false);
  const [epInput, setEpInput] = useState(String(initial.currentEpisode));
  const [minuteInput, setMinuteInput] = useState(String(initial.currentMinute));
  const [currentTags, setCurrentTags] = useState(initial.tags ?? []);

  async function addToLibrary(initialStatus: WatchStatus) {
    setBusy(true);
    const res = await api.post<{ watchItem: { id: string } }>("/api/library", {
      tmdbId: detail.tmdbId,
      mediaType: detail.mediaType,
      status: initialStatus,
    });
    setBusy(false);
    if (res.success && res.data) {
      setInLibrary(true);
      setWatchItemId(res.data.watchItem.id);
      setStatus(initialStatus);
      success(`Đã thêm "${detail.title}" vào thư viện.`);
    } else {
      toastError(res.error ?? "Không thể thêm phim.");
    }
  }

  async function changeStatus(next: WatchStatus) {
    if (!watchItemId) return;
    const res = await api.patch("/api/library", { watchItemId, status: next });
    if (res.success) {
      setStatus(next);
      success("Đã cập nhật trạng thái.");
    } else {
      toastError(res.error ?? "Không thể cập nhật trạng thái.");
    }
  }

  async function refreshTags() {
    if (!watchItemId) return;
    const res = await api.get<any[]>("/api/library");
    if (res.success && res.data) {
      const match = res.data.find((item) => item.id === watchItemId);
      if (match) {
        setCurrentTags(match.tags || []);
      }
    }
  }

  async function setEpisode(target: number, minute?: number) {
    if (!watchItemId) return;
    setBusy(true);
    const res = await api.post<{ currentEpisode: number; currentMinute: number; status: WatchStatus; completed: boolean }>(
      "/api/progress",
      { watchItemId, episode: target, minute },
    );
    setBusy(false);
    if (res.success && res.data) {
      setCurrentEpisode(res.data.currentEpisode);
      setEpInput(String(res.data.currentEpisode));
      if (minute !== undefined) {
        setCurrentMinute(res.data.currentMinute);
        setMinuteInput(String(res.data.currentMinute));
      }
      if (res.data.status) setStatus(res.data.status);
      if (res.data.completed) success(`Đã xem xong "${detail.title}"! 🎉`);
      else success(`Đã cập nhật tới tập ${res.data.currentEpisode}.`);
    } else {
      toastError(res.error ?? "Không thể cập nhật tiến độ.");
    }
  }

  return (
    <div className="flex animate-fade-in-up flex-col gap-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-bg to-secondary/10" />
        <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
          <div className="w-40 shrink-0 md:w-48">
            <PosterImage src={detail.posterPath} alt={detail.title} />
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                {isTv ? "Phim bộ" : "Phim lẻ"}
              </span>
              {inLibrary && <StatusBadge status={status} />}
              <span className="flex items-center gap-1 text-xs font-semibold text-secondary">
                <Star size={12} className="fill-current" />
                {detail.rating.toFixed(1)}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                {detail.title}
              </h1>
              <p className="text-sm text-text-muted">{detail.originalTitle}</p>
            </div>

            {detail.tagline && (
              <p className="text-sm italic text-secondary">&ldquo;{detail.tagline}&rdquo;</p>
            )}

            <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
              {detail.overview || "Chưa có mô tả."}
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-text-secondary">
              {detail.genres.length > 0 && (
                <span>
                  <span className="text-text-muted">Thể loại: </span>
                  {detail.genres.join(", ")}
                </span>
              )}
              {detail.countries.length > 0 && (
                <span>
                  <span className="text-text-muted">Quốc gia: </span>
                  {detail.countries.map((c) => countryLabel(c)).join(", ")}
                </span>
              )}
              {detail.directors.length > 0 && (
                <span>
                  <span className="text-text-muted">Đạo diễn: </span>
                  {detail.directors.join(", ")}
                </span>
              )}
            </div>

            {detail.cast.length > 0 && (
              <p className="text-xs text-text-secondary">
                <span className="text-text-muted">Diễn viên: </span>
                {detail.cast.join(", ")}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-3">
              {!inLibrary ? (
                <>
                  <button
                    onClick={() => addToLibrary("want_to_watch")}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover disabled:opacity-60"
                  >
                    <Plus size={14} /> Thêm vào thư viện
                  </button>
                  <button
                    onClick={() => addToLibrary("watching")}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:opacity-60"
                  >
                    <Play size={14} /> Bắt đầu xem
                  </button>
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-text-secondary">
                    Trạng thái:
                    <select
                      value={status}
                      onChange={(e) => changeStatus(e.target.value as WatchStatus)}
                      aria-label="Đổi trạng thái xem"
                      className="rounded-lg border border-white/8 bg-card p-2 text-xs text-text focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Tag assignment and list */}
                  <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                    <TagAssignment
                      watchItemId={watchItemId || ""}
                      currentTags={currentTags}
                      onUpdate={refreshTags}
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {currentTags.map((mt) => (
                        <span
                          key={mt.tagId}
                          className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium border"
                          style={{
                            backgroundColor: `${mt.tag.color}15`,
                            borderColor: mt.tag.color,
                            color: mt.tag.color,
                          }}
                        >
                          {mt.tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {detail.trailerKey && (
                <a
                  href={`https://www.youtube.com/watch?v=${detail.trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10"
                >
                  <PlayCircle size={14} /> Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TV progress / episode grid */}
      {isTv && inLibrary && (
        <section className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Tiến độ tập</h2>
            <span className="font-mono text-xs text-text-secondary">
              {currentEpisode}/{total > 0 ? total : "?"}
              {currentMinute > 0 && detail.runtime && (
                <span className="text-text-muted"> · {currentMinute}/{detail.runtime}p</span>
              )}
            </span>
          </div>

          <ProgressBar current={currentEpisode} total={total} className="mb-5" />

          {total > 0 && total <= 60 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: total }, (_, i) => i + 1).map((ep) => {
                const watched = ep <= currentEpisode;
                return (
                  <button
                    key={ep}
                    onClick={() => setEpisode(ep)}
                    disabled={busy}
                    aria-label={`Đánh dấu đã xem tới tập ${ep}`}
                    aria-pressed={watched}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md border text-xs font-mono font-semibold transition-all disabled:opacity-50",
                      watched
                        ? "border-primary bg-primary/20 text-white"
                        : "border-white/10 bg-white/5 text-text-secondary hover:border-white/25",
                    )}
                  >
                    {watched ? <Check size={13} /> : ep}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="ep-input" className="text-[10px] text-text-muted">
                  Đã xem tới tập
                </label>
                <input
                  id="ep-input"
                  type="number"
                  min={0}
                  max={total > 0 ? total : undefined}
                  value={epInput}
                  onChange={(e) => setEpInput(e.target.value)}
                  className="w-24 rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="min-input" className="text-[10px] text-text-muted">
                  Phút trong tập
                </label>
                <input
                  id="min-input"
                  type="number"
                  min={0}
                  max={detail.runtime || 90}
                  value={minuteInput}
                  onChange={(e) => setMinuteInput(e.target.value)}
                  className="w-20 rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
              <button
                onClick={() => setEpisode(Number(epInput), Number(minuteInput))}
                disabled={busy}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover disabled:opacity-60"
              >
                Cập nhật
              </button>
              <button
                onClick={() => setEpisode(currentEpisode + 1)}
                disabled={busy || (total > 0 && currentEpisode >= total)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:opacity-40"
              >
                +1 Tập
              </button>
            </div>
          )}
        </section>
      )}

      {/* Đánh giá + review (khi phim đã ở trong thư viện) */}
      {inLibrary && watchItemId && <RatingReviewPanel watchItemId={watchItemId} />}

      <Link href="/library" className="text-xs font-semibold text-secondary hover:underline">
        ← Về thư viện
      </Link>
    </div>
  );
}
