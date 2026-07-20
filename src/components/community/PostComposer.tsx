"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Search, Film, Tv, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { PostItem } from "./types";

import { StarRating } from "./StarRating";
import { AlertTriangle } from "lucide-react";

interface MovieRef {
  type: "movie" | "tv";
  tmdbId: number;
  title: string;
  posterPath: string | null;
}

interface PostComposerProps {
  onCreated: (post: PostItem) => void;
  prefilledMovie?: MovieRef | null;
}

export function PostComposer({ onCreated, prefilledMovie }: PostComposerProps) {
  const { data: session } = useSession();
  const { error: toastError, success } = useToast();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [movie, setMovie] = useState<MovieRef | null>(prefilledMovie ?? null);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [moviePickerOpen, setMoviePickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync prefilledMovie if passed
  useEffect(() => {
    if (prefilledMovie) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMovie(prefilledMovie);
    }
  }, [prefilledMovie]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
  }, [content]);

  // Tạo + cleanup URL preview. Khi image đổi từ có → null thì tự reset preview.
  useEffect(() => {
    if (!image) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImagePreview((prev) => (prev === null ? prev : null));
      return;
    }
    const url = URL.createObjectURL(image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const trimmed = content.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const metadata = {
      content: trimmed,
      imagePath: null,
      movieRefType: movie?.type ?? null,
      movieRefTmdbId: movie?.tmdbId ?? null,
      movieRefTitle: movie?.title ?? null,
      movieRefPoster: movie?.posterPath ?? null,
      isSpoiler,
      communityRating: rating,
    };

    const fd = new FormData();
    fd.append("metadata", JSON.stringify(metadata));
    if (image) fd.append("image", image);

    const res = await fetch("/api/community/posts", {
      method: "POST",
      body: fd,
    });
    setSubmitting(false);

    const data = (await res.json().catch(() => null)) as
      | {
          success: true;
          post: { id: string; createdAt: string; likeCount: number; commentCount: number };
        }
      | { error: string; fieldErrors?: Record<string, string[]> }
      | null;
    if (!res.ok || !data || !("post" in data)) {
      toastError(data && "error" in data ? data.error : "Không thể đăng bài.");
      return;
    }

    // Build PostItem để insert vào list ngay (optimistic)
    const newItem: PostItem = {
      id: data.post.id,
      content: trimmed,
      imagePath: imagePreview,
      movieRefType: movie?.type ?? null,
      movieRefTmdbId: movie?.tmdbId ?? null,
      movieRefTitle: movie?.title ?? null,
      movieRefPoster: movie?.posterPath ?? null,
      isSpoiler,
      communityRating: rating,
      likeCount: 0,
      commentCount: 0,
      createdAt: data.post.createdAt,
      likedByMe: false,
      author: {
        id: session?.user?.id ?? "",
        name: session?.user?.name ?? null,
        handle: null,
        image: session?.user?.image ?? null,
      },
    };
    success("Đã đăng bài viết.");
    setContent("");
    setImage(null);
    setMovie(prefilledMovie ?? null);
    setIsSpoiler(false);
    setRating(null);
    onCreated(newItem);
  }

  return (
    <div className="glass-card space-y-3 p-4">
      <div className="flex gap-3">
        <UserAvatar src={session?.user?.image} name={session?.user?.name ?? "Bạn"} size="md" />
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì về phim hôm nay?"
          className="min-h-[44px] resize-none border-none bg-transparent px-0 py-1 text-sm focus:ring-0"
          maxLength={4000}
        />
      </div>

      {imagePreview && (
        <div className="relative ml-12 max-w-md overflow-hidden rounded-xl border border-white/10">
          <Image
            src={imagePreview}
            alt="Preview"
            width={640}
            height={360}
            className="w-full object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => setImage(null)}
            aria-label="Bỏ ảnh"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white backdrop-blur-md transition-colors hover:bg-black/80"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {movie && (
        <div className="ml-12 flex flex-col gap-2 rounded-xl border border-primary/30 bg-primary/10 p-2.5">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-surface">
              {movie.posterPath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${movie.posterPath}`}
                  alt={movie.title}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-primary">
                  {movie.type === "tv" ? <Tv size={16} /> : <Film size={16} />}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{movie.title}</p>
              <p className="font-mono text-[10px] uppercase text-primary">
                {movie.type === "tv" ? "Phim bộ" : "Phim lẻ"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMovie(null);
                setRating(null);
              }}
              aria-label="Bỏ gắn phim"
              className="rounded-full p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-primary/20 pt-2">
            <span className="text-[10px] font-semibold text-white/60">Đánh giá của bạn:</span>
            <StarRating value={rating} onChange={setRating} size={18} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/5 pt-2">
        <div className="flex items-center gap-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setImage(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={submitting}
            aria-label="Thêm ảnh"
            className="rounded-md p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <ImagePlus size={16} />
          </button>
          <button
            type="button"
            onClick={() => setMoviePickerOpen(true)}
            disabled={submitting || !!movie}
            className="rounded-md p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
            aria-label="Gắn phim"
          >
            <Film size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIsSpoiler((s) => !s)}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
              isSpoiler
                ? "border border-yellow-500/50 bg-yellow-500/20 text-yellow-400"
                : "text-white/40 hover:bg-white/5 hover:text-white/70",
            )}
            title="Đánh dấu bài viết chứa nội dung spoil"
          >
            <AlertTriangle size={13} />
            <span>Spoiler</span>
          </button>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="min-w-[80px]"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : "Đăng"}
        </Button>
      </div>

      {moviePickerOpen && (
        <MoviePicker
          onPick={(m) => {
            setMovie(m);
            setMoviePickerOpen(false);
          }}
          onClose={() => setMoviePickerOpen(false)}
        />
      )}
    </div>
  );
}

interface MoviePickerProps {
  onPick: (movie: MovieRef) => void;
  onClose: () => void;
}

function MoviePicker({ onPick, onClose }: MoviePickerProps) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<
    Array<{
      id: number;
      title: string;
      mediaType: "movie" | "tv";
      posterPath: string | null;
      year: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await api.get<{
        results: Array<{
          id: number;
          title?: string;
          name?: string;
          media_type: "movie" | "tv";
          poster_path: string | null;
          release_date?: string;
          first_air_date?: string;
        }>;
      }>(`/api/tmdb/search`, { q, type: "multi" });
      setLoading(false);
      if (res.success && res.data) {
        setResults(
          res.data.results.slice(0, 8).map((r) => ({
            id: r.id,
            title: r.title ?? r.name ?? "Không rõ",
            mediaType: r.media_type === "tv" ? "tv" : "movie",
            posterPath: r.poster_path,
            year: (r.release_date ?? r.first_air_date ?? "").slice(0, 4) || null,
          })),
        );
      } else {
        setResults((prev) => (prev.length === 0 ? prev : []));
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card flex w-full max-w-lg flex-col gap-3 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Gắn phim</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm phim trên TMDb..."
            className="w-full rounded-lg border border-white/10 bg-bg/40 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none"
          />
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-6 text-white/40">
              <Loader2 size={16} className="animate-spin" />
            </div>
          )}
          {!loading && q.trim().length >= 2 && results.length === 0 && (
            <div className="py-6 text-center text-xs text-white/40">Không có kết quả.</div>
          )}
          {results.map((r) => (
            <button
              key={`${r.mediaType}-${r.id}`}
              type="button"
              onClick={() =>
                onPick({
                  type: r.mediaType,
                  tmdbId: r.id,
                  title: r.year ? `${r.title} (${r.year})` : r.title,
                  posterPath: r.posterPath,
                })
              }
              className={cn(
                "flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-white/5",
              )}
            >
              <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-surface">
                {r.posterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${r.posterPath}`}
                    alt={r.title}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary">
                    {r.mediaType === "tv" ? <Tv size={14} /> : <Film size={14} />}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">{r.title}</p>
                <p className="font-mono text-[9px] uppercase text-white/40">
                  {r.mediaType === "tv" ? "Phim bộ" : "Phim lẻ"}
                  {r.year ? ` · ${r.year}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
