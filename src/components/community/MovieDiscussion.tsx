"use client";

import { useEffect, useState } from "react";
import { Users, Star, MessageSquarePlus } from "lucide-react";
import { PostComposer } from "./PostComposer";
import { PostList } from "./PostList";
import { api } from "@/lib/api";
import { StarRating } from "./StarRating";
import type { MovieScoreResponse, PostItem } from "./types";

interface MovieDiscussionProps {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

/**
 * Embedded community discussion section for movie/tv show detail page.
 * Displays community rating score, post composer with prefilled movie, and filtered post feed.
 */
export function MovieDiscussion({ tmdbId, type, title, posterPath }: MovieDiscussionProps) {
  const [bumpKey, setBumpKey] = useState(0);
  const [score, setScore] = useState<MovieScoreResponse | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    api.get<MovieScoreResponse>(`/api/community/movie-score`, { tmdbId }).then((res) => {
      if (res.success && res.data) {
        setScore(res.data);
      }
    });
  }, [tmdbId, bumpKey]);

  return (
    <div className="space-y-6">
      {/* Community Score Header Card */}
      <div className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
            <Star size={24} className="fill-current" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {score?.avgScore ? score.avgScore.toFixed(1) : "—"}
              </span>
              <span className="text-xs text-white/40">/ 5 sao</span>
            </div>
            <p className="text-xs text-white/60">
              Đánh giá từ Cộng đồng CineOS ({score?.totalVotes ?? 0} lượt đánh giá)
            </p>
            {score?.avgScore && (
              <div className="mt-1">
                <StarRating value={Math.round(score.avgScore)} readonly size={14} />
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setComposerOpen((o) => !o)}
          className="flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/20 px-4 py-2.5 text-xs font-bold text-primary transition-all hover:bg-primary/30"
        >
          <MessageSquarePlus size={16} />
          {composerOpen ? "Đóng trình soạn bài" : "Thảo luận về phim này"}
        </button>
      </div>

      {/* Embedded Post Composer */}
      {composerOpen && (
        <PostComposer
          prefilledMovie={{ type, tmdbId, title, posterPath }}
          onCreated={() => {
            setBumpKey((k) => k + 1);
            setComposerOpen(false);
          }}
        />
      )}

      {/* Filtered Feed for this movie */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-white/60">
          <Users size={14} className="text-primary" />
          Bài viết thảo luận ({score?.totalPosts ?? 0})
        </h3>
        <PostList key={bumpKey} movieTmdbId={tmdbId} pollIntervalMs={8000} />
      </div>
    </div>
  );
}
