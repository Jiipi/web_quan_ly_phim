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
//
// Mỗi entry mang metadata: kind (tv/movie), genres, country — để chấm điểm theo
// favGenres / favCountries / preferTvShows của user. Càng trùng gu càng cao điểm.
interface PoolEntry {
  title: string;
  kind: "tv" | "movie";
  genres: string[];
  country: string;
}
const RECOMMEND_POOL: PoolEntry[] = [
  {
    title: "Chiếc Bật Lửa Và Váy Công Chúa",
    kind: "tv",
    genres: ["Romance", "Drama"],
    country: "KR",
  },
  { title: "Hạ Cánh Nơi Anh", kind: "tv", genres: ["Romance", "Drama"], country: "KR" },
  { title: "Reply 1988", kind: "tv", genres: ["Drama", "Comedy"], country: "KR" },
  { title: "Điều Kỳ Diệu Ở Phòng Giam Số 7", kind: "movie", genres: ["Drama"], country: "KR" },
  { title: "Người Dơi", kind: "movie", genres: ["Action", "Sci-Fi"], country: "US" },
  { title: "Interstellar", kind: "movie", genres: ["Sci-Fi", "Drama"], country: "US" },
  { title: "Inception", kind: "movie", genres: ["Action", "Sci-Fi"], country: "US" },
  { title: "Parasite", kind: "movie", genres: ["Thriller", "Drama"], country: "KR" },
  { title: "Avengers: Endgame", kind: "movie", genres: ["Action", "Sci-Fi"], country: "US" },
  { title: "Coco", kind: "movie", genres: ["Animation", "Drama"], country: "US" },
  { title: "Your Name", kind: "movie", genres: ["Animation", "Romance"], country: "JP" },
  { title: "Spirited Away", kind: "movie", genres: ["Animation", "Fantasy"], country: "JP" },
  { title: "Oldboy", kind: "movie", genres: ["Thriller", "Mystery"], country: "KR" },
  { title: "Train to Busan", kind: "movie", genres: ["Horror", "Action"], country: "KR" },
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

    const favGenresLower = input.favGenres.map((g) => g.toLowerCase());
    const favCountriesUpper = input.favCountries.map((c) => c.toUpperCase());

    // Chấm điểm từng entry theo độ trùng với gu người dùng.
    // - genres trùng: +25 mỗi cái (cap 50)
    // - country trùng: +15
    // - đúng kind (tv/movie) theo preferTvShows: +15
    // - có trong thư viện: loại bỏ
    type Scored = PoolEntry & { score: number };
    const scored: Scored[] = RECOMMEND_POOL.filter((p) => !inLibrary(p.title)).map((p) => {
      let score = 50; // baseline
      const matchedGenres = p.genres.filter((g) => favGenresLower.includes(g.toLowerCase()));
      score += Math.min(matchedGenres.length, 2) * 25;
      if (favCountriesUpper.includes(p.country.toUpperCase())) score += 15;
      if (input.preferTvShows && p.kind === "tv") score += 15;
      if (input.preferTvShows === false && p.kind === "movie") score += 5;
      return { ...p, score };
    });

    // Xếp giảm dần, lấy top 3.
    scored.sort((a, b) => b.score - a.score);
    const chosen = scored.slice(0, 3);
    const max = chosen[0]?.score ?? 50;
    const min = chosen[chosen.length - 1]?.score ?? 50;
    const range = Math.max(max - min, 1);

    const genreLabel = input.favGenres.join(", ") || "đa dạng";
    const countryLabel = input.favCountries.join(", ");
    const moodPart = input.mood ? `, hợp tâm trạng "${input.mood}"` : "";
    const tvPart = input.preferTvShows ? ", thiên về phim bộ" : "";

    return {
      recommendations: chosen.map((c, i) => {
        // Match score 60..95 tỉ lệ nghịch với rank.
        const matchScore = Math.round(95 - (i * (95 - 60)) / Math.max(chosen.length - 1, 1));
        const matchedGenre = c.genres.find((g) => favGenresLower.includes(g.toLowerCase()));
        const reason =
          (matchedGenre ? `Trùng thể loại ${matchedGenre}` : "Gợi ý mở rộng") +
          (favCountriesUpper.includes(c.country.toUpperCase()) ? `, phim ${c.country}` : "") +
          (input.preferTvShows && c.kind === "tv" ? ", phim bộ" : "") +
          `${moodPart}. Phù hợp gu ${genreLabel}${countryLabel ? ` từ ${countryLabel}` : ""}${tvPart}.`;
        // Silence unused-vars warning for range/max/min (kept for future tuning).
        void range;
        return { title: c.title, reason, matchScore };
      }),
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

  async chat(input): Promise<ReadableStream<string>> {
    const lastMsg = input.messages[input.messages.length - 1]?.content ?? "";
    const mockReply =
      `Xin chào! Bạn vừa hỏi: "${lastMsg.slice(0, 50)}". ` +
      `Đây là trả lời mock từ CineBot AI. ` +
      `Mình có thể giúp bạn tìm phim, gợi ý theo tâm trạng, hoặc tóm tắt phim không spoil. ` +
      `Hãy kết nối Groq (miễn phí) hoặc OpenAI để nhận câu trả lời thật nhé! 🎬`;

    return new ReadableStream<string>({
      start(controller) {
        for (const char of mockReply) {
          controller.enqueue(char);
        }
        controller.close();
      },
    });
  },
};
