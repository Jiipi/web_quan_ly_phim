"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, Film, Tv, Sparkles } from "lucide-react";
import { MovieGrid } from "@/components/shared/MovieGrid";
import { MovieRow } from "@/components/shared/MovieRow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/FadeIn";
import { api } from "@/lib/api";

interface DiscoverResult {
  id: number;
  title: string;
  originalTitle: string;
  mediaType: string;
  posterPath: string | null;
  releaseDate: string | null;
  rating: number;
}

const DEFAULT_RESULTS: DiscoverResult[] = [
  {
    id: 114479,
    title: "Vụng Trộm Không Thể Giấu",
    originalTitle: "Hidden Love",
    mediaType: "tv",
    posterPath: "/images/posters/hidden-love.jpg",
    releaseDate: "2023-06-20",
    rating: 8.7,
  },
  {
    id: 196454,
    title: "Chiếc Bật Lửa Và Váy Công Chúa",
    originalTitle: "Lighter and Princess",
    mediaType: "tv",
    posterPath: "/images/posters/chiec-bat-lua.jpg",
    releaseDate: "2022-11-03",
    rating: 8.6,
  },
  {
    id: 34307,
    title: "Thám Tử Lừng Danh Conan",
    originalTitle: "Detective Conan",
    mediaType: "tv",
    posterPath: "/images/posters/conan.jpg",
    releaseDate: "1996-01-08",
    rating: 8.9,
  },
  {
    id: 414906,
    title: "Người Dơi",
    originalTitle: "The Batman",
    mediaType: "movie",
    posterPath: "/images/posters/the-batman.jpg",
    releaseDate: "2022-03-02",
    rating: 7.7,
  },
];

const TV_HIGHLIGHTS: DiscoverResult[] = [
  {
    id: 60625,
    title: "Rick and Morty",
    originalTitle: "Rick and Morty",
    mediaType: "tv",
    posterPath: "/images/posters/rick-morty.jpg",
    releaseDate: "2013-12-02",
    rating: 8.7,
  },
  {
    id: 1399,
    title: "Trò Chơi Vương Quyền",
    originalTitle: "Game of Thrones",
    mediaType: "tv",
    posterPath: "/images/posters/got.jpg",
    releaseDate: "2011-04-17",
    rating: 8.4,
  },
  {
    id: 2316,
    title: "The Office",
    originalTitle: "The Office",
    mediaType: "tv",
    posterPath: "/images/posters/office.jpg",
    releaseDate: "2005-03-24",
    rating: 8.5,
  },
];

const MOVIE_HIGHLIGHTS: DiscoverResult[] = [
  {
    id: 27205,
    title: "Kẻ Hủy Diệt",
    originalTitle: "Inception",
    mediaType: "movie",
    posterPath: "/images/posters/inception.jpg",
    releaseDate: "2010-07-15",
    rating: 8.4,
  },
  {
    id: 155,
    title: "Kỵ Sĩ Bóng Đêm",
    originalTitle: "The Dark Knight",
    mediaType: "movie",
    posterPath: "/images/posters/dark-knight.jpg",
    releaseDate: "2008-07-16",
    rating: 8.5,
  },
  {
    id: 680,
    title: "Pulp Fiction",
    originalTitle: "Pulp Fiction",
    mediaType: "movie",
    posterPath: "/images/posters/pulp.jpg",
    releaseDate: "1994-10-14",
    rating: 8.5,
  },
];

function toMovieRowItem(r: DiscoverResult) {
  return {
    id: String(r.id),
    tmdbId: r.id,
    mediaType: (r.mediaType === "tv" ? "tv" : "movie") as "movie" | "tv",
    title: r.title,
    originalTitle: r.originalTitle,
    posterPath: r.posterPath,
    rating: r.rating,
    releaseDate: r.releaseDate,
  };
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [results, setResults] = useState<DiscoverResult[]>(DEFAULT_RESULTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setResults(DEFAULT_RESULTS);
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

  return (
    <FadeIn className="flex flex-col gap-6">
      {/* Header */}
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
            <MovieGrid items={results.map(toMovieRowItem)} />
          </section>
        )
      ) : (
        // Default — featured rows
        <div className="flex flex-col gap-8">
          <MovieRow
            title="Gợi ý hôm nay"
            subtitle="Những phim được đề xuất để bạn bắt đầu"
            items={DEFAULT_RESULTS.map(toMovieRowItem)}
            showQuickActions
          />
          <MovieRow
            title="Phim bộ nổi bật"
            items={TV_HIGHLIGHTS.map(toMovieRowItem)}
            showQuickActions
          />
          <MovieRow
            title="Phim lẻ hay"
            items={MOVIE_HIGHLIGHTS.map(toMovieRowItem)}
            showQuickActions
          />
        </div>
      )}
    </FadeIn>
  );
}
