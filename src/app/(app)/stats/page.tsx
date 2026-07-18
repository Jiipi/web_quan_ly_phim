"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TrendingUp, Calendar, Clock, Film, Flame, Trophy, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { HeatmapCalendar, type HeatmapDay } from "@/components/stats/HeatmapCalendar";
import { TopRatedList, type TopRatedItem } from "@/components/stats/TopRatedList";
import { StreakWidget } from "@/components/stats/StreakWidget";
import { api } from "@/lib/api";
import { useLibrary, type LibraryItem } from "@/lib/use-library";

// Recharts is heavy — split out of initial bundle.
const StatsCharts = dynamic(() => import("@/components/stats/StatsCharts"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
});

interface StatsData {
  totalCompleted: number;
  totalEpisodes: number;
  totalHours: number;
  avgPerActiveDay: string;
  byCountry: { name: string; count: number }[];
  byGenre: { name: string; value: number }[];
  history: { day: string; episodes: number }[];
}

function toHeatmapData(sessions: { watchedAt: string }[]): HeatmapDay[] {
  const counts = new Map<string, number>();
  sessions.forEach((s) => {
    const d = new Date(s.watchedAt);
    const iso = d.toISOString().split("T")[0];
    counts.set(iso, (counts.get(iso) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

function computeStreak(heatmap: HeatmapDay[]) {
  if (heatmap.length === 0) return { current: 0, longest: 0 };
  const sorted = [...heatmap].sort((a, b) => a.date.localeCompare(b.date));
  // Longest streak
  let longest = 0;
  let cur = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    if (prev === null) {
      cur = 1;
    } else {
      const prevDate = new Date(prev);
      const curDate = new Date(day.date);
      const diff = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      cur = diff === 1 ? cur + 1 : 1;
    }
    longest = Math.max(longest, cur);
    prev = day.date;
  }
  // Current streak: count back from today
  const dates = new Set(heatmap.map((d) => d.date));
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  let currentStreak = 0;
  let cursor: Date;
  if (dates.has(today)) cursor = new Date(today);
  else if (dates.has(yesterday)) cursor = new Date(yesterday);
  else cursor = new Date(0);
  while (dates.has(cursor.toISOString().split("T")[0])) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { current: currentStreak, longest };
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { items } = useLibrary();

  useEffect(() => {
    let active = true;
    // Fetch last 6 months of sessions for the heatmap.
    const now = new Date();
    const monthPromises: Promise<unknown>[] = [Promise.resolve(api.get<StatsData>("/api/stats"))];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthPromises.push(
        Promise.resolve(
          api.get<{ entries: { watchedAt: string }[] }>(`/api/calendar?month=${month}`),
        ),
      );
    }
    Promise.all(monthPromises).then((results) => {
      if (!active) return;
      const statsRes = results[0] as Awaited<ReturnType<typeof api.get<StatsData>>>;
      const monthResponses = results.slice(1) as Awaited<
        ReturnType<typeof api.get<{ entries: { watchedAt: string }[] }>>
      >[];
      if (statsRes.success && statsRes.data) setData(statsRes.data);
      else setError(true);
      const allSessions = monthResponses
        .flatMap((r) => (r.success && r.data?.entries ? r.data.entries : []))
        .map((e) => ({ watchedAt: e.watchedAt }));
      setHeatmap(toHeatmapData(allSessions));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const streak = computeStreak(heatmap);

  const topRated: TopRatedItem[] = React.useMemo(() => {
    const completed = items.filter(
      (i: LibraryItem) => i.status === "completed" || i.personalScore !== null,
    );
    return [...completed]
      .sort((a, b) => {
        const aScore = (a.personalScore ?? 0) + a.mediaItem.tmdbRating;
        const bScore = (b.personalScore ?? 0) + b.mediaItem.tmdbRating;
        return bScore - aScore;
      })
      .slice(0, 10)
      .map((item, idx) => ({
        id: item.id,
        tmdbId: item.mediaItem.tmdbId,
        mediaType: item.mediaItem.mediaType as "movie" | "tv",
        title: item.mediaItem.title,
        originalTitle: item.mediaItem.originalTitle,
        posterPath: item.mediaItem.posterPath,
        rating: item.mediaItem.tmdbRating,
        personalScore: item.personalScore,
        rank: idx + 1,
      }));
  }, [items]);

  const hasData = data && (data.totalEpisodes > 0 || data.byCountry.length > 0);

  return (
    <FadeIn className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Thống kê thói quen</h1>
        <p className="mt-1 text-xs text-text-secondary">
          Trực quan hoá tần suất xem và gu thưởng thức từ dữ liệu thư viện của bạn.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : error || !hasData ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 size={28} />
            </div>
            <h3 className="text-base font-bold">Chưa có dữ liệu thống kê</h3>
            <p className="max-w-md text-xs text-text-secondary">
              {error
                ? "Đã có lỗi khi tải dữ liệu. Thử lại sau."
                : "Thêm phim và cập nhật tiến độ để xem thống kê thói quen của bạn."}
            </p>
            {!error && (
              <Button asChild size="sm" className="mt-2">
                <Link href="/discover">Khám phá phim</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 4 KPI cards with gradient text */}
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StaggerItem>
              <Card className="stats-card">
                <CardContent className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    <Film size={12} className="text-primary" />
                    Hoàn thành
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-gradient-cinema">
                    {data.totalCompleted}
                  </div>
                  <div className="text-[9px] text-text-secondary">Phim trạng thái đã xong</div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="stats-card">
                <CardContent className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    <TrendingUp size={12} className="text-secondary" />
                    Số tập đã cày
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-gradient-cinema">
                    {data.totalEpisodes}
                  </div>
                  <div className="text-[9px] text-text-secondary">Cộng dồn toàn thư viện</div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="stats-card">
                <CardContent className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    <Clock size={12} className="text-accent" />
                    Tổng thời gian
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-gradient-accent">
                    {data.totalHours}h
                  </div>
                  <div className="text-[9px] text-text-secondary">Ước tính theo runtime</div>
                </CardContent>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="stats-card">
                <CardContent className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    <Calendar size={12} className="text-watching" />
                    Tần suất 7 ngày
                  </div>
                  <div className="font-mono text-3xl font-extrabold text-watching">
                    {data.avgPerActiveDay}
                  </div>
                  <div className="text-[9px] text-text-secondary">Tập / ngày hoạt động</div>
                </CardContent>
              </Card>
            </StaggerItem>
          </Stagger>

          {/* Streak widget */}
          <StreakWidget current={streak.current} longest={streak.longest} />

          {/* Heatmap */}
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <header className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
                  <Flame size={14} className="text-primary" />
                  Hoạt động 6 tháng gần nhất
                </h3>
                <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30">
                  {heatmap.reduce((s, d) => s + d.count, 0)} tập / {heatmap.length} ngày
                </Badge>
              </header>
              <div className="overflow-x-auto">
                <HeatmapCalendar data={heatmap} weeks={26} />
              </div>
            </CardContent>
          </Card>

          {/* Charts + Top rated row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <StatsCharts data={data} />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-3">
              <header className="flex items-center gap-1.5">
                <Trophy size={14} className="text-secondary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Top phim của bạn
                </h3>
              </header>
              <TopRatedList items={topRated} />
            </div>
          </div>
        </>
      )}
    </FadeIn>
  );
}
