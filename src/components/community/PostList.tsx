"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { usePoll } from "@/lib/use-poll";
import { PostCard } from "./PostCard";
import type { FeedResponse, PostItem } from "./types";

interface PostListProps {
  /** Nếu đặt, lọc post của user này (cho trang profile) */
  authorId?: string;
  /** Lọc post theo phim cụ thể */
  movieTmdbId?: number | null;
  /** Tab feed: explore | following | popular */
  tab?: "explore" | "following" | "popular";
  /** Callback khi click nút lọc theo phim trên PostCard */
  onMovieSelect?: (tmdbId: number) => void;
  /** Polling interval (ms). Mặc định 5s. */
  pollIntervalMs?: number;
}

export function PostList({
  authorId,
  movieTmdbId,
  tab = "explore",
  onMovieSelect,
  pollIntervalMs = 5000,
}: PostListProps) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      const params: Record<string, string | number> = { limit: 20, tab };
      if (!reset && cursor) params.cursor = cursor;
      if (authorId) params.authorId = authorId;
      if (movieTmdbId) params.movieTmdbId = movieTmdbId;

      const res = await api.get<FeedResponse>("/api/community/feed", params);
      if (reset) setLoading(false);
      else setLoadingMore(false);

      if (!res.success || !res.data) {
        setError(res.error ?? "Không thể tải feed.");
        return;
      }
      setPosts((prev) => (reset ? res.data!.posts : [...prev, ...res.data!.posts]));
      setCursor(res.data.nextCursor);
      setHasMore(!!res.data.nextCursor);
    },
    [cursor, authorId, movieTmdbId, tab],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorId, movieTmdbId, tab]);

  // Poll để refresh nhẹ nhàng
  usePoll({
    fn: async () => {
      const res = await api.get<FeedResponse>("/api/community/feed", {
        limit: 50,
        tab,
        ...(authorId ? { authorId } : {}),
        ...(movieTmdbId ? { movieTmdbId } : {}),
      });
      if (res.success && res.data) {
        setPosts((prev) => {
          if (prev.length !== res.data!.posts.length) return res.data!.posts;
          // Nếu cùng số, so sánh id cuối để tránh update vô ích
          if (prev[0]?.id !== res.data!.posts[0]?.id) return res.data!.posts;
          return prev;
        });
      }
    },
    intervalMs: pollIntervalMs,
  });

  function handlePostChange(next: PostItem) {
    setPosts((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  }

  function handlePostDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-white/40">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-dropped/30 bg-dropped/10 p-4 text-center text-sm text-dropped">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm font-bold text-white">Chưa có bài viết nào.</p>
        <p className="mt-1 text-xs text-white/50">
          {movieTmdbId
            ? "Hãy là người đầu tiên thảo luận về bộ phim này!"
            : "Hãy là người đầu tiên chia sẻ!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onChange={handlePostChange}
          onDelete={handlePostDelete}
          onMovieSelect={onMovieSelect}
        />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => fetchPage(false)}
            disabled={loadingMore}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Tải thêm"}
          </button>
        </div>
      )}
    </div>
  );
}
