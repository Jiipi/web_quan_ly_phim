"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Play,
  PlayCircle,
  Check,
  Star,
  Clock,
  CheckCircle2,
  Pencil,
  Save,
  Bell,
  Trash2,
} from "lucide-react";
import type { MediaDetail, DetailInitial } from "@/lib/media-detail";
import { PosterImage } from "@/components/shared/PosterImage";
import { StatusBadge, type WatchStatus } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RatingReviewPanel } from "@/components/detail/RatingReviewPanel";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn, formatDate, toDateInputValue } from "@/lib/utils";
import { countryLabel, STATUS_OPTIONS } from "@/lib/labels";
import { TagAssignment } from "@/components/tags/TagAssignment";

/** 1 ô hiển thị thông tin mốc thời gian (read-only). */
function TimelineStat({
  icon,
  iconClass,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", iconClass)}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <span className="text-sm font-medium text-white">{value}</span>
      </div>
    </div>
  );
}

/** 1 input date trong edit-mode có label + icon đồng nhất với TimelineStat. */
function DateField({
  id,
  label,
  icon,
  iconClass,
  value,
  onChange,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconClass: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", iconClass)}>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-[10px] font-semibold uppercase tracking-wider text-text-muted"
        >
          {label}
        </label>
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:border-primary/50 focus:outline-none [color-scheme:dark]"
        />
      </div>
    </div>
  );
}

/** Input mini cho từng tập: nhập số phút đang xem dở, bấm Enter / Save để lưu. */
function EpisodeMinuteField({
  episode,
  currentMinute,
  runtime,
  onSave,
  busy,
}: {
  episode: number;
  currentMinute: number | null;
  runtime: number;
  onSave: (minute: number) => void;
  busy: boolean;
}) {
  const [value, setValue] = useState(
    currentMinute !== null && currentMinute !== undefined ? String(currentMinute) : "",
  );
  const [dirty, setDirty] = useState(false);

  // Đồng bộ khi prop từ ngoài đổi (ví dụ: reload sau khi lưu).
  useEffect(() => {
    if (!dirty) {
      const timer = setTimeout(() => {
        setValue(
          currentMinute !== null && currentMinute !== undefined ? String(currentMinute) : "",
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentMinute, dirty]);

  const commit = () => {
    if (value === "" || value === null) return;
    const raw = Math.floor(Number(value));
    if (!Number.isFinite(raw) || raw < 0) return;
    // Clamp về [0, runtime] thay vì block — UX thân thiện hơn.
    const m = Math.min(raw, runtime);
    if (m !== raw) setValue(String(m));
    onSave(m);
    setDirty(false);
  };

  return (
    <label
      htmlFor={`ep-min-${episode}`}
      className="flex flex-col items-center gap-1 rounded-md border border-white/5 bg-white/2 px-1 py-1.5 text-[10px] text-text-secondary transition-colors hover:border-white/15"
    >
      <span className="font-mono font-bold text-text-muted">T{episode}</span>
      <input
        id={`ep-min-${episode}`}
        type="number"
        min={0}
        max={runtime}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setDirty(true);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        disabled={busy}
        placeholder="-"
        aria-label={`Phút đang xem dở tập ${episode}`}
        className="w-full min-w-0 rounded border-0 bg-transparent px-1 py-0.5 text-center font-mono text-[10px] text-white placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  );
}

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
  const [startedAt, setStartedAt] = useState<string | null>(initial.startedAt);
  const [completedAt, setCompletedAt] = useState<string | null>(initial.completedAt);
  const [lastWatchedAt, setLastWatchedAt] = useState<string | null>(initial.lastWatchedAt);
  const [busy, setBusy] = useState(false);

  // Per-episode minute cache (số phút đang xem dở của từng tập).
  // Map: { [episodeNumber]: minute | null }
  const [episodeMinutes, setEpisodeMinutes] = useState<Record<number, number | null>>(
    initial.episodeMinutes ?? {},
  );

  // Edit-mode cho 3 mốc thời gian (user tự chọn, default = giá trị hiện tại).
  const [editingDates, setEditingDates] = useState(false);
  const [dateStarted, setDateStarted] = useState(toDateInputValue(initial.startedAt));
  const [dateCompleted, setDateCompleted] = useState(toDateInputValue(initial.completedAt));
  const [dateLastWatched, setDateLastWatched] = useState(toDateInputValue(initial.lastWatchedAt));
  const [savingDates, setSavingDates] = useState(false);
  const [epInput, setEpInput] = useState(String(initial.currentEpisode));
  const [minuteInput, setMinuteInput] = useState(String(initial.currentMinute));
  const [currentTags, setCurrentTags] = useState(initial.tags ?? []);

  // Reminders state & handlers
  const [reminders, setReminders] = useState<
    Array<{ id: string; remindAt: string; message: string }>
  >([]);
  const [selectedRemindDays, setSelectedRemindDays] = useState<number>(3);

  useEffect(() => {
    if (watchItemId) {
      api
        .get<{
          reminders: Array<{ id: string; watchItemId: string; remindAt: string; message: string }>;
        }>("/api/reminders")
        .then((res) => {
          if (res.success && res.data) {
            const itemReminders = res.data.reminders.filter((r) => r.watchItemId === watchItemId);
            setReminders(itemReminders);
          }
        });
    } else {
      const timer = setTimeout(() => {
        setReminders([]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [watchItemId]);

  async function handleAddReminder() {
    if (!watchItemId) return;
    setBusy(true);
    const res = await api.post<{
      success: boolean;
      reminder: { id: string; remindAt: string; message: string };
    }>("/api/reminders", {
      watchItemId,
      remindInDays: selectedRemindDays,
      message: `Đã đến lúc xem tiếp "${detail.title}"! 🍿`,
    });
    setBusy(false);
    if (res.success && res.data && res.data.reminder) {
      const newReminder = res.data.reminder;
      success("Đã hẹn giờ nhắc nhở thành công!");
      setReminders((prev) => [...prev, newReminder]);
    } else {
      toastError(res.error ?? "Không thể cài lịch nhắc.");
    }
  }

  async function handleDeleteReminder(id: string) {
    setBusy(true);
    const res = await api.delete(`/api/reminders?id=${id}`);
    setBusy(false);
    if (res.success) {
      success("Đã huỷ lịch nhắc nhở.");
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } else {
      toastError(res.error ?? "Không thể huỷ lịch nhắc.");
    }
  }

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

  interface LibraryItemWithTags {
    id: string;
    tags?: Array<{ tagId: string; tag: { id: string; name: string; color: string } }>;
  }

  async function refreshTags() {
    if (!watchItemId) return;
    const res = await api.get<LibraryItemWithTags[]>("/api/library");
    if (res.success && res.data) {
      const match = res.data.find((item) => item.id === watchItemId);
      if (match) {
        setCurrentTags(match.tags || []);
      }
    }
  }

  async function saveDates() {
    if (!watchItemId) return;
    setSavingDates(true);
    const payload: Record<string, string | null> = {
      watchItemId,
    };
    // Nếu input rỗng -> null (xoá mốc). Nếu có giá trị -> ISO string.
    payload.startedAt = dateStarted ? new Date(dateStarted).toISOString() : null;
    payload.completedAt = dateCompleted ? new Date(dateCompleted).toISOString() : null;
    payload.lastWatchedAt = dateLastWatched ? new Date(dateLastWatched).toISOString() : null;

    const res = await api.patch<{
      startedAt: string | null;
      completedAt: string | null;
      lastWatchedAt: string | null;
    }>("/api/progress", payload);

    setSavingDates(false);
    if (res.success && res.data) {
      setStartedAt(res.data.startedAt);
      setCompletedAt(res.data.completedAt);
      setLastWatchedAt(res.data.lastWatchedAt);
      setEditingDates(false);
      success("Đã cập nhật mốc thời gian.");
    } else {
      toastError(res.error ?? "Không thể lưu mốc thời gian.");
    }
  }

  async function saveEpisodeMinute(episodeNumber: number, minute: number) {
    if (!watchItemId) return;
    setBusy(true);
    const res = await api.post<{
      currentEpisode: number;
      currentMinute: number;
      status: WatchStatus;
      completed: boolean;
    }>("/api/progress", { watchItemId, episode: episodeNumber, minute });
    setBusy(false);
    if (res.success) {
      setEpisodeMinutes((prev) => ({ ...prev, [episodeNumber]: minute }));
      success(`Đã lưu tập ${episodeNumber}: phút ${minute}.`);
    } else {
      toastError(res.error ?? "Không thể lưu phút.");
    }
  }

  async function setEpisode(target: number, minute?: number) {
    if (!watchItemId) return;
    setBusy(true);
    const res = await api.post<{
      currentEpisode: number;
      currentMinute: number;
      status: WatchStatus;
      completed: boolean;
      startedAt: string | null;
      completedAt: string | null;
      lastWatchedAt: string | null;
    }>("/api/progress", { watchItemId, episode: target, minute });
    setBusy(false);
    if (res.success && res.data) {
      setCurrentEpisode(res.data.currentEpisode);
      setEpInput(String(res.data.currentEpisode));
      if (minute !== undefined) {
        setCurrentMinute(res.data.currentMinute);
        setMinuteInput(String(res.data.currentMinute));
      }
      if (res.data.status) setStatus(res.data.status);
      if (res.data.startedAt) setStartedAt(res.data.startedAt);
      if (res.data.completedAt) setCompletedAt(res.data.completedAt);
      if (res.data.lastWatchedAt) setLastWatchedAt(res.data.lastWatchedAt);
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

      {/* Timeline & Reminders Grid */}
      {inLibrary && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Timeline mốc thời gian */}
          <section
            aria-label="Mốc thời gian theo dõi"
            className="glass-card flex flex-wrap gap-x-8 gap-y-3 p-5 h-full relative"
          >
            {editingDates ? (
              <div className="flex w-full flex-col gap-3">
                <div className="flex flex-col gap-y-3">
                  <DateField
                    id="started-date"
                    label="Bắt đầu xem"
                    icon={<Play size={14} />}
                    iconClass="bg-secondary/15 text-secondary"
                    value={dateStarted}
                    onChange={setDateStarted}
                  />
                  <DateField
                    id="lastwatched-date"
                    label="Lần xem cuối"
                    icon={<Clock size={14} />}
                    iconClass="bg-primary/15 text-primary"
                    value={dateLastWatched}
                    onChange={setDateLastWatched}
                  />
                  <DateField
                    id="completed-date"
                    label="Hoàn thành"
                    icon={<CheckCircle2 size={14} />}
                    iconClass="bg-emerald-500/15 text-emerald-400"
                    value={dateCompleted}
                    onChange={setDateCompleted}
                  />
                  <div className="flex items-center gap-2 mt-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDates(false);
                        setDateStarted(toDateInputValue(startedAt));
                        setDateCompleted(toDateInputValue(completedAt));
                        setDateLastWatched(toDateInputValue(lastWatchedAt));
                      }}
                      disabled={savingDates}
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-white/10 disabled:opacity-50"
                    >
                      Huỷ
                    </button>
                    <button
                      type="button"
                      onClick={saveDates}
                      disabled={savingDates}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover disabled:opacity-60"
                    >
                      <Save size={12} /> {savingDates ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </div>
                <p className="text-[9px] text-text-muted">
                  Để trống = xoá mốc đó. Ngày sẽ lưu theo giờ địa phương của bạn.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full justify-between h-full">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Mốc thời gian
                  </h3>
                  {startedAt && (
                    <TimelineStat
                      icon={<Play size={15} />}
                      iconClass="bg-secondary/15 text-secondary"
                      label="Bắt đầu xem"
                      value={formatDate(startedAt)}
                    />
                  )}
                  {lastWatchedAt && (
                    <TimelineStat
                      icon={<Clock size={15} />}
                      iconClass="bg-primary/15 text-primary"
                      label="Lần xem cuối"
                      value={formatDate(lastWatchedAt)}
                    />
                  )}
                  {completedAt && (
                    <TimelineStat
                      icon={<CheckCircle2 size={15} />}
                      iconClass="bg-emerald-500/15 text-emerald-400"
                      label="Hoàn thành"
                      value={formatDate(completedAt)}
                    />
                  )}
                  {!startedAt && !completedAt && !lastWatchedAt && (
                    <span className="text-xs text-text-muted">
                      {'Chưa có mốc thời gian nào. Bấm "Sửa" để thêm.'}
                    </span>
                  )}
                </div>
                <div className="flex justify-end mt-auto pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDates(true)}
                    className="inline-flex items-center gap-1 self-center rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary transition-all hover:bg-white/10 hover:text-white"
                    aria-label="Sửa mốc thời gian"
                  >
                    <Pencil size={11} /> Sửa
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Reminders Section */}
          <section className="glass-card p-5 flex flex-col gap-3 h-full relative justify-between">
            <div className="flex flex-col gap-3 w-full">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1.5">
                <Bell size={13} className="text-primary" /> Nhắc nhở xem tiếp
              </h3>

              {reminders.length === 0 ? (
                <div className="text-xs text-text-secondary leading-relaxed bg-white/5 border border-white/5 rounded-xl p-3">
                  Bạn chưa lên lịch nhắc nhở cho phim này. Chọn số ngày bên dưới và bấm nút để cài
                  lịch nhắc nhở.
                </div>
              ) : (
                <div className="space-y-2">
                  {reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl p-3"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-semibold text-text truncate">{rem.message}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Nhắc lúc: {new Date(rem.remindAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteReminder(rem.id)}
                        disabled={busy}
                        aria-label="Huỷ nhắc nhở"
                        className="rounded-full bg-white/5 hover:bg-dropped/10 text-text-muted hover:text-dropped p-1.5 transition-colors shrink-0 disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-auto pt-2 justify-end w-full">
              <label
                htmlFor="remind-days"
                className="text-[10px] font-semibold uppercase tracking-wider text-text-muted"
              >
                Nhắc sau:
              </label>
              <select
                id="remind-days"
                value={selectedRemindDays}
                onChange={(e) => setSelectedRemindDays(Number(e.target.value))}
                className="rounded-lg border border-white/8 bg-card p-1.5 text-xs text-text focus:outline-none"
              >
                <option value={1}>1 ngày</option>
                <option value={3}>3 ngày</option>
                <option value={7}>7 ngày</option>
                <option value={14}>14 ngày</option>
              </select>
              <button
                onClick={handleAddReminder}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover disabled:opacity-60"
              >
                <Plus size={12} /> Hẹn giờ
              </button>
            </div>
          </section>
        </div>
      )}

      {/* TV progress / episode grid */}
      {isTv && inLibrary && (
        <section className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Tiến độ tập</h2>
            <span className="font-mono text-xs text-text-secondary">
              {currentEpisode}/{total > 0 ? total : "?"}
              {currentMinute > 0 && detail.runtime && (
                <span className="text-text-muted">
                  {" "}
                  · {currentMinute}/{detail.runtime}p
                </span>
              )}
            </span>
          </div>

          <ProgressBar current={currentEpisode} total={total} className="mb-5" />

          {total > 0 && total <= 60 ? (
            <div className="flex flex-col gap-3">
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
              {/* Mini-grid: chọn số phút đang xem dở của từng tập */}
              <div className="rounded-lg border border-white/5 bg-white/2 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Phút đang xem dở{" "}
                  <span className="normal-case text-text-muted/70">(để trống = đã xem hết)</span>
                </p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                  {Array.from({ length: total }, (_, i) => i + 1).map((ep) => (
                    <EpisodeMinuteField
                      key={ep}
                      episode={ep}
                      currentMinute={episodeMinutes[ep] ?? null}
                      runtime={detail.runtime ?? 90}
                      onSave={(m) => saveEpisodeMinute(ep, m)}
                      busy={busy}
                    />
                  ))}
                </div>
              </div>
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
