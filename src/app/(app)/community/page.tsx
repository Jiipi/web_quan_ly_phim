"use client";

import { useState } from "react";
import { Users, Compass, UserCheck, Flame, X, Film } from "lucide-react";
import { PostComposer } from "@/components/community/PostComposer";
import { PostList } from "@/components/community/PostList";
import { TrendingSidebar } from "@/components/community/TrendingSidebar";
import { cn } from "@/lib/utils";

type TabType = "explore" | "following" | "popular";

export default function CommunityPage() {
  const [bumpKey, setBumpKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("explore");
  const [activeMovieId, setActiveMovieId] = useState<number | null>(null);

  const TABS = [
    { id: "explore" as const, label: "Khám phá", icon: Compass },
    { id: "following" as const, label: "Đang theo dõi", icon: UserCheck },
    { id: "popular" as const, label: "Phổ biến", icon: Flame },
  ];

  return (
    <div className="mx-auto max-w-5xl animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Users className="text-primary" size={22} />
          Cộng đồng CineOS
        </h1>
        <p className="mt-1 text-xs text-text-secondary">
          Chia sẻ cảm nhận, thảo luận về điện ảnh và kết nối với những người cùng sở thích.
        </p>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Composer + Tabs + Feed (Span 2) */}
        <div className="space-y-5 lg:col-span-2">
          {/* Post Composer */}
          <PostComposer onCreated={() => setBumpKey((k) => k + 1)} />

          {/* Active Movie Filter Badge */}
          {activeMovieId && (
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-primary" />
                <span className="text-xs font-bold text-white">
                  Đang lọc bài viết theo phim #{activeMovieId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveMovieId(null)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X size={14} /> Xoá lọc
              </button>
            </div>
          )}

          {/* Feed Navigation Tabs */}
          <div className="flex border-b border-white/10">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && !activeMovieId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setActiveMovieId(null);
                  }}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-white/50 hover:text-white",
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Post Feed */}
          <PostList
            key={`${bumpKey}-${activeTab}-${activeMovieId}`}
            tab={activeTab}
            movieTmdbId={activeMovieId}
            onMovieSelect={(tmdbId) => setActiveMovieId(tmdbId)}
          />
        </div>

        {/* Right Column: Trending Sidebar */}
        <div className="hidden lg:block">
          <TrendingSidebar
            activeMovieId={activeMovieId}
            onSelectMovie={(tmdbId) => setActiveMovieId(tmdbId)}
          />
        </div>
      </div>
    </div>
  );
}
