import { COUNTRY_LABELS } from "./labels";
export { COUNTRY_LABELS };

export interface StatsItem {
  status: string;
  currentEpisode: number;
  mediaItem: { runtime: number | null; genres: string[]; countries: string[] };
}

export interface StatsSession {
  watchedAt: Date;
}

export interface StatsResult {
  totalCompleted: number;
  totalEpisodes: number;
  totalHours: number;
  avgPerActiveDay: string;
  byCountry: { name: string; count: number }[];
  byGenre: { name: string; value: number }[];
  history: { day: string; episodes: number }[];
}

const DEFAULT_EP_RUNTIME = 45;

function topCounts(values: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}

/** Tổng hợp thống kê từ thư viện + lịch sử xem (thuần, dễ test). */
export function computeStats(
  items: StatsItem[],
  sessions: StatsSession[],
  now: Date = new Date(),
): StatsResult {
  const totalCompleted = items.filter((i) => i.status === "completed").length;
  const totalEpisodes = items.reduce((s, i) => s + i.currentEpisode, 0);
  const totalMinutes = items.reduce(
    (s, i) => s + i.currentEpisode * (i.mediaItem.runtime || DEFAULT_EP_RUNTIME),
    0,
  );
  const totalHours = Math.round(totalMinutes / 60);

  const countryMap = topCounts(items.flatMap((i) => i.mediaItem.countries));
  const byCountry = [...countryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({ name: COUNTRY_LABELS[code] ?? code, count }));

  const genreMap = topCounts(items.flatMap((i) => i.mediaItem.genres));
  const byGenre = [...genreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // 7 ngày gần nhất: số session (tập) mỗi ngày.
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const history: { day: string; episodes: number }[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() - offset);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const episodes = sessions.filter((s) => s.watchedAt >= dayStart && s.watchedAt < dayEnd).length;
    const dd = String(dayStart.getDate()).padStart(2, "0");
    const mm = String(dayStart.getMonth() + 1).padStart(2, "0");
    history.push({ day: `${dd}/${mm}`, episodes });
  }

  const total7 = history.reduce((s, h) => s + h.episodes, 0);
  const activeDays = history.filter((h) => h.episodes > 0).length;
  const avgPerActiveDay = activeDays > 0 ? (total7 / activeDays).toFixed(1) : "0";

  return {
    totalCompleted,
    totalEpisodes,
    totalHours,
    avgPerActiveDay,
    byCountry,
    byGenre,
    history,
  };
}
