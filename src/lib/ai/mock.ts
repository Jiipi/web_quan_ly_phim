import type {
  AIProvider,
  AIRecommendInput,
  AIRecommendResult,
  AISummaryInput,
  AISummaryResult,
  AITasteProfileInput,
  AITasteProfileResult,
} from "./types";

// Pool gợi ý cho mock. Một số tựa trùng catalog TMDb mock (Chiếc Bật Lửa, Người Dơi)
// nên resolve được tmdbId -> "Thêm watchlist" chạy end-to-end ngay cả khi offline.
const RECOMMEND_POOL: { title: string }[] = [
  { title: "Chiếc Bật Lửa Và Váy Công Chúa" },
  { title: "Hạ Cánh Nơi Anh" },
  { title: "Reply 1988" },
  { title: "Điều Kỳ Diệu Ở Phòng Giam Số 7" },
  { title: "Người Dơi" },
];

function topCounts(items: string[]): { key: string; count: number }[] {
  const map = new Map<string, number>();
  for (const it of items) map.set(it, (map.get(it) ?? 0) + 1);
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({ key, count }));
}

/**
 * Provider AI giả lập — luôn sẵn sàng, không cần API key.
 * Đầu ra bám theo input để hợp lý & test được.
 */
export const mockProvider: AIProvider = {
  name: "mock",

  async summarize(input: AISummaryInput): Promise<AISummaryResult> {
    const upto =
      input.mediaType === "tv" ? `tính tới hết tập ${input.currentEpisode}` : "phần đầu phim";
    return {
      summary:
        `Tóm tắt (không spoil) ${upto} của "${input.title}": ` +
        (input.overview
          ? input.overview.slice(0, 240)
          : "câu chuyện đang phát triển các tuyến nhân vật chính và mối quan hệ của họ.") +
        " Nội dung sau mốc này được giữ kín để tránh tiết lộ.",
      characters: [
        { name: "Nhân vật chính", note: "Đang trong hành trình phát triển chính của câu chuyện." },
      ],
      conflicts: [`Mâu thuẫn trung tâm được thiết lập tới ${upto}.`],
    };
  },

  async recommend(input: AIRecommendInput): Promise<AIRecommendResult> {
    const inLibrary = (title: string) =>
      input.libraryTitles.some(
        (l) =>
          l.toLowerCase().includes(title.toLowerCase()) ||
          title.toLowerCase().includes(l.toLowerCase()),
      );
    // Ưu tiên tựa chưa có trong thư viện; nếu không đủ thì lấy thêm từ pool.
    const fresh = RECOMMEND_POOL.filter((p) => !inLibrary(p.title));
    const chosen = (fresh.length >= 2 ? fresh : RECOMMEND_POOL).slice(0, 3);
    const genre = input.favGenres.join(", ") || "đa dạng";
    const moodPart = input.mood ? ` hợp tâm trạng "${input.mood}"` : "";
    return {
      recommendations: chosen.map((c, i) => ({
        title: c.title,
        reason: `Gợi ý theo gu ${genre}${moodPart}. Một lựa chọn mới ngoài ${input.libraryTitles.length} phim bạn đang có.`,
        matchScore: 95 - i * 6,
      })),
    };
  },

  async tasteProfile(input: AITasteProfileInput): Promise<AITasteProfileResult> {
    const topGenres = topCounts(input.genres).map((g) => ({ genre: g.key, count: g.count }));
    const topCountries = topCounts(input.countries).map((c) => ({
      country: c.key,
      count: c.count,
    }));
    const favGenre = topGenres[0]?.genre ?? "đa dạng";
    const avg =
      input.ratedTitles.length > 0
        ? input.ratedTitles.reduce((s, r) => s + r.score, 0) / input.ratedTitles.length
        : 0;
    return {
      profileText:
        `Bạn nghiêng về thể loại ${favGenre}` +
        (topCountries[0] ? `, ưa phim từ ${topCountries[0].country}` : "") +
        `. Điểm trung bình bạn chấm khoảng ${avg.toFixed(1)}/10 trên ${input.ratedTitles.length} phim đã đánh giá.`,
      topGenres,
      topCountries,
    };
  },
};
