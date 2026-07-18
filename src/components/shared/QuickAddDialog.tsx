"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { X, Search, Film, Tv, Play, Plus, ListPlus, Loader2, Star } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useLibrary } from "@/lib/use-library";
import { PosterImage } from "./PosterImage";
import { RatingDisplay } from "./RatingDisplay";
import { type WatchStatus } from "./StatusBadge";

interface QuickAddMedia {
  id: number;
  title: string;
  originalTitle: string;
  mediaType: "movie" | "tv";
  posterPath: string | null;
  releaseDate: string | null;
  rating: number;
}

interface MediaDetail {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  originalTitle: string;
  tagline: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  runtime: number | null;
  numberOfEpisodes: number;
  genres: string[];
  countries: string[];
  directors: string[];
  cast: string[];
  trailerKey: string | null;
  rating: number;
}

interface QuickAddContextValue {
  openQuickAdd: (prefilled?: { id: number; type: "movie" | "tv" }) => void;
}

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) {
    throw new Error("useQuickAdd phải được sử dụng bên trong <QuickAddProvider>");
  }
  return ctx;
}

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefilled, setPrefilled] = useState<{ id: number; type: "movie" | "tv" } | undefined>(
    undefined,
  );

  const openQuickAdd = (prefilledMedia?: { id: number; type: "movie" | "tv" }) => {
    setPrefilled(prefilledMedia);
    setIsOpen(true);
  };

  return (
    <QuickAddContext.Provider value={{ openQuickAdd }}>
      {children}
      {isOpen && <QuickAddDialog prefilled={prefilled} onClose={() => setIsOpen(false)} />}
    </QuickAddContext.Provider>
  );
}

function QuickAddDialog({
  prefilled,
  onClose,
}: {
  prefilled?: { id: number; type: "movie" | "tv" };
  onClose: () => void;
}) {
  const { success, error: toastError } = useToast();
  const { reload } = useLibrary();

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<QuickAddMedia[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState<QuickAddMedia | null>(null);
  const [mediaDetail, setMediaDetail] = useState<MediaDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [status, setStatus] = useState<WatchStatus>("watching");
  const [personalScore, setPersonalScore] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Debounce search TMDB
  useEffect(() => {
    if (prefilled) return; // Nếu có prefilled thì không search
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(async () => {
      const res = await api.get<QuickAddMedia[]>("/api/tmdb/search", { q: trimmed });
      setIsSearching(false);
      if (res.success && res.data) {
        setSearchResults(res.data.slice(0, 5));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, prefilled]);

  // Load detail khi chọn phim (gọi trực tiếp từ event handler)
  const handleSelectMedia = async (media: { id: number; type: "movie" | "tv" }) => {
    setIsLoadingDetail(true);
    setMediaDetail(null);
    const res = await api.get<MediaDetail>("/api/tmdb/detail", {
      id: media.id,
      type: media.type,
    });
    setIsLoadingDetail(false);
    if (res.success && res.data) {
      setMediaDetail(res.data);
    } else {
      toastError(res.error ?? "Không thể lấy chi tiết phim.");
    }
  };

  // Tải chi tiết phim khi có prefilled
  useEffect(() => {
    if (!prefilled) return;
    let active = true;

    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      setMediaDetail(null);
      const res = await api.get<MediaDetail>("/api/tmdb/detail", {
        id: prefilled.id,
        type: prefilled.type,
      });
      if (!active) return;
      setIsLoadingDetail(false);
      if (res.success && res.data) {
        setMediaDetail(res.data);
      } else {
        toastError(res.error ?? "Không thể lấy chi tiết phim.");
      }
    };

    fetchDetail();

    return () => {
      active = false;
    };
  }, [prefilled, toastError]);

  const handleAdd = async () => {
    const target = mediaDetail || selectedMedia;
    if (!target) return;

    setIsSubmitting(true);
    const id = "tmdbId" in target ? target.tmdbId : target.id;
    const type = target.mediaType;

    const res = await api.post("/api/library", {
      tmdbId: id,
      mediaType: type,
      status,
      personalScore: personalScore > 0 ? personalScore : undefined,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    if (res.success) {
      success(`Đã thêm "${target.title}" vào thư viện!`);
      await reload();
      onClose();
    } else {
      toastError(res.error ?? "Không thể thêm phim.");
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  const currentYear = (dateStr: string | null) => {
    if (!dateStr) return "";
    return dateStr.split("-")[0];
  };

  const getCountryLabel = (code?: string) => {
    const labels: Record<string, string> = {
      VN: "Việt Nam",
      KR: "Hàn Quốc",
      CN: "Trung Quốc",
      JP: "Nhật Bản",
      US: "Mỹ",
      TH: "Thái Lan",
    };
    return code ? (labels[code] ?? code) : "";
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-black/75 p-4 pt-[10vh] backdrop-blur-sm transition-all duration-300"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="glass-panel relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Plus size={16} className="text-primary" />
            Thêm phim nhanh
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-text-secondary hover:bg-white/5 hover:text-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6 flex flex-col gap-5">
          {!prefilled && !selectedMedia && (
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 text-text-muted" size={16} />
                <input
                  type="text"
                  autoFocus
                  placeholder="Gõ tên Anime, Phim Trung Quốc, Mỹ..."
                  value={query}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuery(val);
                    if (val.trim().length < 2) {
                      setSearchResults([]);
                      setIsSearching(false);
                    } else {
                      setIsSearching(true);
                    }
                  }}
                  className="w-full rounded-xl border border-white/8 bg-white/5 py-3 pl-11 pr-10 text-xs text-text placeholder:text-text-muted transition-colors focus:border-primary/50 focus:outline-none"
                />
                {isSearching && (
                  <Loader2
                    className="absolute right-3 top-3 animate-spin text-text-muted"
                    size={16}
                  />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/2 p-2">
                  {searchResults.map((media) => (
                    <button
                      key={`${media.mediaType}-${media.id}`}
                      onClick={() => {
                        setSelectedMedia(media);
                        handleSelectMedia({ id: media.id, type: media.mediaType });
                      }}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/5"
                    >
                      <div className="h-12 w-9 overflow-hidden rounded bg-white/5 shrink-0">
                        <PosterImage src={media.posterPath} alt={media.title} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-xs font-bold text-white">{media.title}</h4>
                        <p className="truncate text-[10px] text-text-muted">
                          {media.originalTitle}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold text-text-secondary">
                          {media.mediaType === "tv" ? <Tv size={10} /> : <Film size={10} />}
                          {media.mediaType === "tv" ? "Phim bộ" : "Phim lẻ"}
                          {media.releaseDate && ` • ${currentYear(media.releaseDate)}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
                <p className="text-center text-xs text-text-muted py-4">
                  Không tìm thấy phim nào khớp từ khóa.
                </p>
              )}
            </div>
          )}

          {/* Loading Detail state */}
          {isLoadingDetail && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-xs text-text-secondary">Đang tải thông tin phim từ TMDb...</p>
            </div>
          )}

          {/* Preview & Options when media is selected */}
          {mediaDetail && (
            <div className="flex flex-col gap-5 animate-fade-in-up">
              {/* Media Preview Card */}
              <div className="flex gap-4 rounded-xl border border-white/8 bg-white/3 p-4">
                <div className="w-24 shrink-0 overflow-hidden rounded-lg shadow-md bg-white/5">
                  <PosterImage src={mediaDetail.posterPath} alt={mediaDetail.title} />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="truncate text-sm font-bold text-white">{mediaDetail.title}</h3>
                    <p className="truncate text-[11px] text-text-muted mb-1">
                      {mediaDetail.originalTitle}
                    </p>
                    <div className="flex flex-wrap gap-1 items-center text-[10px] text-text-secondary mb-2">
                      <span className="rounded bg-white/8 px-1.5 py-0.5 font-bold text-[9px] uppercase">
                        {mediaDetail.mediaType === "tv" ? "TV Show" : "Movie"}
                      </span>
                      {mediaDetail.releaseDate && (
                        <span>• {currentYear(mediaDetail.releaseDate)}</span>
                      )}
                      {mediaDetail.countries && mediaDetail.countries.length > 0 && (
                        <span>• {getCountryLabel(mediaDetail.countries[0])}</span>
                      )}
                      {mediaDetail.mediaType === "tv" && (
                        <span className="font-semibold text-accent">
                          • {mediaDetail.numberOfEpisodes} tập
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted line-clamp-3 leading-relaxed">
                      {mediaDetail.overview || "Không có tóm tắt."}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
                    <RatingDisplay score={mediaDetail.rating} showStars={true} size="sm" />
                    <span className="text-[9px] text-text-muted">TMDb</span>
                  </div>
                </div>
              </div>

              {/* Status and customization fields */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Trạng thái theo dõi
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["watching", "Đang xem", Play],
                        ["want_to_watch", "Muốn xem", ListPlus],
                        ["completed", "Đã xong", Star],
                      ] as const
                    ).map(([val, label, Icon]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setStatus(val)}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-semibold transition-all ${
                          status === val
                            ? "border-primary bg-primary/10 text-primary shadow-glow-primary/10"
                            : "border-white/8 bg-white/3 text-text-secondary hover:bg-white/5 hover:text-text"
                        }`}
                      >
                        <Icon size={13} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {status === "completed" && (
                  <div className="flex flex-col gap-1.5 animate-fade-in-up">
                    <label
                      htmlFor="personal-score"
                      className="text-[10px] font-bold uppercase tracking-wider text-text-muted"
                    >
                      Điểm cá nhân (1 - 10)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        id="personal-score"
                        value={personalScore}
                        onChange={(e) => setPersonalScore(Number(e.target.value))}
                        className="rounded-lg border border-white/8 bg-card px-3 py-2 text-xs text-white focus:border-primary/50 focus:outline-none"
                      >
                        <option value={0}>Chưa chấm</option>
                        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} điểm
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="media-note"
                    className="text-[10px] font-bold uppercase tracking-wider text-text-muted"
                  >
                    Ghi chú cá nhân
                  </label>
                  <textarea
                    id="media-note"
                    rows={2}
                    placeholder="Nhập cảm nghĩ, tập phim đang coi dở hoặc link xem..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-white/5 p-3 text-xs text-text placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                {!prefilled && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMedia(null);
                      setMediaDetail(null);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-text hover:bg-white/10"
                  >
                    Quay lại
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isSubmitting}
                  className="rounded-full bg-primary px-6 py-2 text-xs font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={13} />}
                  Thêm vào thư viện
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
