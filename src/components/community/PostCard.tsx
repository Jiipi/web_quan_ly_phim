"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Film, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatCount, timeAgo } from "@/lib/community";
import type { PostItem } from "./types";

import { StarRating } from "./StarRating";
import { AlertTriangle, Eye } from "lucide-react";

interface PostCardProps {
  post: PostItem;
  /** Callback sau khi like/unlike (optimistic update đã làm trong component) */
  onChange?: (next: PostItem) => void;
  /** Callback khi xoá post */
  onDelete?: (postId: string) => void;
  /** Có hiển thị link đến post detail không (mặc định true) */
  showDetailLink?: boolean;
  /** Callback khi click vào thẻ phim để filter feed */
  onMovieSelect?: (tmdbId: number) => void;
}

export function PostCard({
  post,
  onChange,
  onDelete,
  showDetailLink = true,
  onMovieSelect,
}: PostCardProps) {
  const { data: session } = useSession();
  const { confirm } = useConfirm();
  const { error: toastError, success } = useToast();
  const meId = session?.user?.id;
  const isOwner = meId === post.author.id;
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [busyLike, setBusyLike] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busyLike) return;
    setBusyLike(true);
    const prev = liked;
    setLiked(!prev);
    setLikeCount((c) => c + (prev ? -1 : 1));
    const res = await api.post<{ liked: boolean }>(`/api/community/posts/${post.id}/like`);
    setBusyLike(false);
    if (!res.success) {
      setLiked(prev);
      setLikeCount((c) => c + (prev ? 1 : -1));
      toastError(res.error ?? "Không thể thích bài viết.");
      return;
    }
    const next = res.data?.liked ?? !prev;
    setLiked(next);
    onChange?.({
      ...post,
      likedByMe: next,
      likeCount: likeCount + (next && !prev ? 1 : !next && prev ? -1 : 0),
    });
  }

  async function handleDelete() {
    setMenuOpen(false);
    const ok = await confirm({
      title: "Xoá bài viết?",
      message: "Bài viết và toàn bộ bình luận, lượt thích sẽ bị xoá. Không thể hoàn tác.",
      danger: true,
      confirmLabel: "Xoá",
    });
    if (!ok) return;
    const res = await api.delete(`/api/community/posts/${post.id}`);
    if (!res.success) {
      toastError(res.error ?? "Không thể xoá.");
      return;
    }
    success("Đã xoá bài viết.");
    onDelete?.(post.id);
  }

  const profileHref = post.author.handle ? `/u/${post.author.handle}` : "#";
  const detailHref = `/community/post/${post.id}`;
  const movieHref =
    post.movieRefTmdbId && post.movieRefType
      ? `/${post.movieRefType === "tv" ? "show" : "movie"}/${post.movieRefTmdbId}`
      : null;

  return (
    <article
      className={cn(
        "glass-card overflow-hidden border border-white/5 p-0",
        "transition-all hover:border-primary/30",
      )}
    >
      <header className="flex items-start gap-3 px-4 pt-4">
        <Link href={profileHref} className="shrink-0">
          <UserAvatar src={post.author.image} name={post.author.name ?? "U"} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={profileHref} className="text-sm font-bold text-white hover:text-primary">
            {post.author.name ?? "Người dùng"}
            {post.author.handle && (
              <span className="ml-1.5 font-mono text-[10px] font-normal text-white/40">
                @{post.author.handle}
              </span>
            )}
          </Link>
          <p className="mt-0.5 font-mono text-[10px] text-white/40">
            {timeAgo(new Date(post.createdAt))}
          </p>
        </div>
        {isOwner && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Tùy chọn"
              className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-lg border border-white/10 bg-bg/95 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-dropped transition-colors hover:bg-dropped/10"
                >
                  <Trash2 size={14} /> Xoá bài viết
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Spoiler Badge */}
      {post.isSpoiler && (
        <div className="mx-4 mt-2 flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-[11px] font-semibold text-yellow-400">
          <span className="flex items-center gap-1.5">
            <AlertTriangle size={13} />
            Bài viết có chứa nội dung Spoil
          </span>
          <button
            type="button"
            onClick={() => setShowSpoiler((s) => !s)}
            className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-yellow-300 hover:underline"
          >
            <Eye size={12} />
            {showSpoiler ? "Ẩn Spoil" : "Xem nội dung"}
          </button>
        </div>
      )}

      {/* Post Content */}
      <div className="px-4 pb-3 pt-2">
        <p
          className={cn(
            "whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90 transition-all duration-300",
            post.isSpoiler && !showSpoiler && "select-none blur-sm filter",
          )}
        >
          {post.content}
        </p>
      </div>

      {/* Attached Movie Card */}
      {movieHref && (
        <div className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 transition-all hover:border-primary/50 hover:bg-primary/10">
          <Link href={movieHref} className="flex flex-1 items-center gap-3 min-w-0">
            <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-surface">
              {post.movieRefPoster ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${post.movieRefPoster}`}
                  alt={post.movieRefTitle ?? "Poster"}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-primary">
                  <Film size={20} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-primary">
                Đang nói về
              </p>
              <p className="mt-0.5 truncate text-xs font-bold text-white hover:underline">
                {post.movieRefTitle ?? "Phim"}
              </p>
              {post.communityRating && (
                <div className="mt-1">
                  <StarRating value={post.communityRating} readonly size={12} />
                </div>
              )}
            </div>
          </Link>
          {onMovieSelect && post.movieRefTmdbId && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onMovieSelect(post.movieRefTmdbId!);
              }}
              className="shrink-0 rounded-full border border-primary/30 bg-primary/20 px-2.5 py-1 font-mono text-[9px] font-bold uppercase text-primary hover:bg-primary/30"
            >
              Lọc theo phim
            </button>
          )}
        </div>
      )}

      {post.imagePath && (
        <div className="relative aspect-video w-full overflow-hidden bg-black/30">
          <Image
            src={post.imagePath}
            alt="Ảnh bài viết"
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <footer className="flex items-center gap-1 border-t border-white/5 px-4 py-2">
        <button
          type="button"
          onClick={toggleLike}
          disabled={busyLike}
          aria-pressed={liked}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-all",
            liked
              ? "bg-primary/15 text-primary"
              : "text-white/60 hover:bg-white/5 hover:text-white",
            busyLike && "opacity-60",
          )}
        >
          <Heart size={14} className={liked ? "fill-current" : ""} />
          <span>{formatCount(likeCount)}</span>
        </button>
        {showDetailLink ? (
          <Link
            href={detailHref}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold text-white/60 transition-all hover:bg-white/5 hover:text-white"
          >
            <MessageCircle size={14} />
            <span>{formatCount(post.commentCount)}</span>
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold text-white/40">
            <MessageCircle size={14} />
            <span>{formatCount(post.commentCount)}</span>
          </span>
        )}
      </footer>
    </article>
  );
}
