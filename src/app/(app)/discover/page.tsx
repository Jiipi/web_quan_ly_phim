"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Film, Tv, Sparkles, RefreshCw, Clock } from "lucide-react";
import { MovieGrid } from "@/components/shared/MovieGrid";
import { MovieRow } from "@/components/shared/MovieRow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/FadeIn";
import { api } from "@/lib/api";
import { TopicFilter } from "@/components/topics/TopicFilter";
import { useQuickAdd } from "@/components/shared/QuickAddDialog";

interface DiscoverResult {
  tmdbId: number;
  title: string;
  originalTitle: string;
  mediaType: "movie" | "tv";
  posterPath: string | null;
  releaseDate: string | null;
  rating: number;
}

interface DiscoveryData {
  trending: DiscoverResult[];
  trendingMovies: DiscoverResult[];
  trendingTv: DiscoverResult[];
  topRatedMovies: DiscoverResult[];
  topRatedTv: DiscoverResult[];
  newMovies: DiscoverResult[];
  airingToday: DiscoverResult[];
  trendingRefreshed: boolean;
}

export default function DiscoverPage() {
  const router = useRouter();
  const { openQuickAdd } = useQuickAdd();

  const [searchQuery, setSearchQuery] = useState("");
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [results, setResults] = useState<DiscoverResult[]>([]);
  const [topicResults, setTopicResults] = useState<DiscoverResult[]>([]);
  const [discovery, setDiscovery] = useState<DiscoveryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function toMovieRowItem(r: DiscoverResult) {
    return {
      id: String(r.tmdbId),
      tmdbId: r.tmdbId,
      mediaType: r.mediaType,
      title: r.title,
      originalTitle: r.originalTitle,
      posterPath: r.posterPath,
      rating: r.rating,
      releaseDate: r.releaseDate,
      onAdd: () => openQuickAdd({ id: r.tmdbId, type: r.mediaType }),
      onPlay: () => router.push(`/${r.mediaType === "tv" ? "show" : "movie"}/${r.tmdbId}`),
    };
  }
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(true);
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Fetch topic-specific results
  const fetchTopicResults = useCallback(
    async (topics: string[]) => {
      if (topics.length === 0) {
        setTopicResults([]);
        return;
      }

      setIsLoadingTopic(true);
      try {
        const allResults: DiscoverResult[] = [];

        for (const topic of topics) {
          const res = await api.get<{ success: boolean; topic: string; results: DiscoverResult[] }>(
            `/api/discover/topics?topic=${encodeURIComponent(topic)}&mediaType=${mediaType}`,
          );
          console.log("Topic API response:", topic, res);
          if (res.success && res.data?.results) {
            allResults.push(...res.data.results);
          }
        }

        console.log("All results before dedup:", allResults.length);

        console.log("All results before dedup:", allResults.length);

        // Deduplicate by tmdbId
        const seen = new Set<number>();
        const unique = allResults.filter((r) => {
          if (seen.has(r.tmdbId)) return false;
          seen.add(r.tmdbId);
          return true;
        });

        console.log("Unique results after dedup:", unique.length);
        setTopicResults(unique);
      } catch (err) {
        console.error("Failed to fetch topic results:", err);
        setTopicResults([]);
      } finally {
        setIsLoadingTopic(false);
      }
    },
    [mediaType],
  );

  // Fetch topic results when topics or mediaType changes
  useEffect(() => {
    console.log("Topics changed:", selectedTopics, "mediaType:", mediaType);
    const timer = setTimeout(() => {
      fetchTopicResults(selectedTopics);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedTopics, mediaType, fetchTopicResults]);

  const fetchDiscovery = useCallback(async (forceRefresh = false) => {
    setIsLoadingDiscovery(true);
    try {
      const res = await api.get<DiscoveryData & { success: boolean }>(
        `/api/discover${forceRefresh ? "?refresh=true" : ""}`,
      );
      if (res.success && res.data) {
        setDiscovery(res.data as DiscoveryData);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch discovery:", err);
    } finally {
      setIsLoadingDiscovery(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDiscovery();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDiscovery]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const res = await api.get<DiscoverResult[]>("/api/tmdb/search", {
        q: searchQuery,
        type: mediaType,
      });
      setIsLoading(false);
      if (res.success && res.data) setResults(res.data);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, mediaType]);

  const isSearching = searchQuery.trim().length > 0;

  const handleRefresh = () => fetchDiscovery(true);

  const formatLastRefreshed = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 1) return "Vừa xong";
    if (diff < 60) return `${diff} phút trước`;
    const hours = Math.floor(diff / 60);
    return `${hours} giờ trước`;
  };

  return (
    <FadeIn className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Badge
            variant="outline"
            className="mb-2 bg-secondary/15 text-secondary border-secondary/30"
          >
            <Sparkles size={10} /> TMDb
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight">Khám phá phim mới</h1>
          <p className="mt-1 text-xs text-text-secondary">
            Tìm phim lẻ hoặc phim bộ từ kho dữ liệu TMDb để thêm vào thư viện theo dõi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="hidden text-[10px] text-text-muted sm:block">
              <Clock size={10} className="mr-1 inline" />
              Cập nhật {formatLastRefreshed(lastRefreshed)}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoadingDiscovery}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-secondary transition-all hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoadingDiscovery ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-lg flex-1">
          <Search className="absolute left-3.5 top-3 text-text-muted" size={16} />
          <Input
            type="text"
            placeholder="Nhập tên phim (Việt hoặc Anh)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Tìm phim trên TMDb"
            className="pl-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3.5 top-3 animate-spin text-primary" size={16} />
          )}
        </div>

        <Tabs value={mediaType} onValueChange={(v) => setMediaType(v as typeof mediaType)}>
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="movie">
              <Film size={12} className="mr-1" /> Phim lẻ
            </TabsTrigger>
            <TabsTrigger value="tv">
              <Tv size={12} className="mr-1" /> Phim bộ
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Topic Filter */}
      <TopicFilter selectedTopics={selectedTopics} onTopicsChange={setSelectedTopics} />

      {/* Content */}
      {isSearching ? (
        // Search results
        isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-20">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-xs text-text-secondary">Đang tìm trên TMDb...</p>
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-text-muted">
                <Search size={20} />
              </div>
              <h4 className="text-sm font-bold">Không tìm thấy kết quả</h4>
              <p className="max-w-xs text-xs leading-relaxed text-text-secondary">
                Thử từ khoá khác hoặc đổi bộ lọc phim lẻ / phim bộ.
              </p>
            </CardContent>
          </Card>
        ) : (
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-text">
              Kết quả ({results.length})
            </h3>
            <MovieGrid items={results.map(toMovieRowItem)} showQuickActions />
          </section>
        )
      ) : selectedTopics.length > 0 ? (
        // Topic-filtered results from TMDb API
        isLoadingTopic ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-20">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-xs text-text-secondary">Đang tìm phim theo chủ đề...</p>
            </CardContent>
          </Card>
        ) : topicResults.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-text-muted">
                <Sparkles size={20} />
              </div>
              <h4 className="text-sm font-bold">Không tìm thấy phim</h4>
              <p className="max-w-xs text-xs leading-relaxed text-text-secondary">
                Không có phim nào cho chủ đề đã chọn.
              </p>
            </CardContent>
          </Card>
        ) : (
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-text">
              {selectedTopics.join(", ")} ({topicResults.length})
            </h3>
            <MovieGrid items={topicResults.map(toMovieRowItem)} showQuickActions />
          </section>
        )
      ) : isLoadingDiscovery ? (
        // Loading discovery sections
        <div className="flex flex-col gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-3 h-5 w-48 rounded bg-white/5" />
              <div className="mb-4 h-3 w-32 rounded bg-white/5" />
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-52 w-36 shrink-0 rounded-lg bg-white/5" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : discovery ? (
        // Real data sections (no topics selected)
        <div className="flex flex-col gap-8">
          {/* Trending Today */}
          {discovery.trending?.length > 0 && (
            <MovieRow
              title="Xu hướng hôm nay"
              subtitle="Những phim đang hot nhất"
              items={discovery.trending.slice(0, 10).map(toMovieRowItem)}
              showQuickActions
            />
          )}

          {/* Top Rated Movies */}
          {discovery.topRatedMovies?.length > 0 && (
            <MovieRow
              title="Phim lẻ đáng xem nhất"
              subtitle="Điểm cao từ khán giả"
              items={discovery.topRatedMovies.slice(0, 10).map(toMovieRowItem)}
              showQuickActions
            />
          )}

          {/* Top Rated TV */}
          {discovery.topRatedTv?.length > 0 && (
            <MovieRow
              title="Phim bộ đáng xem nhất"
              subtitle="Top series mọi thời đại"
              items={discovery.topRatedTv.slice(0, 10).map(toMovieRowItem)}
              showQuickActions
            />
          )}

          {/* Trending Movies */}
          {discovery.trendingMovies?.length > 0 && (
            <MovieRow
              title="Phim lẻ thịnh hành"
              items={discovery.trendingMovies.slice(0, 10).map(toMovieRowItem)}
              showQuickActions
            />
          )}

          {/* Trending TV */}
          {discovery.trendingTv?.length > 0 && (
            <MovieRow
              title="Phim bộ thịnh hành"
              items={discovery.trendingTv.slice(0, 10).map(toMovieRowItem)}
              showQuickActions
            />
          )}

          {/* New Movies */}
          {discovery.newMovies?.length > 0 && (
            <MovieRow
              title="Phim mới chiếu rạp"
              subtitle="Đang hoặc sắp chiếu"
              items={discovery.newMovies.slice(0, 10).map(toMovieRowItem)}
              showQuickActions
            />
          )}

          {/* Airing Today */}
          {discovery.airingToday?.length > 0 && (
            <MovieRow
              title="Phát sóng hôm nay"
              subtitle="Những tập mới nhất"
              items={discovery.airingToday.slice(0, 10).map(toMovieRowItem)}
              showQuickActions
            />
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-text-muted">
              <Sparkles size={20} />
            </div>
            <h4 className="text-sm font-bold">Không thể tải dữ liệu</h4>
            <p className="max-w-xs text-xs leading-relaxed text-text-secondary">
              Đã xảy ra lỗi khi kết nối với TMDb. Thử làm mới trang.
            </p>
          </CardContent>
        </Card>
      )}
    </FadeIn>
  );
}
