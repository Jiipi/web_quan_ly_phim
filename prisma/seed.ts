import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:adminpassword123@localhost:5432/phimflow_db?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** Mật khẩu dev dùng chung cho các tài khoản seed (đăng nhập thử). */
const DEV_PASSWORD = "Password123!";

const PLATFORMS = [
  "Netflix",
  "iQIYI",
  "WeTV",
  "Bilibili",
  "Disney+",
  "FPT Play",
  "YouTube",
  "Local File",
  "Khác",
];

const MEDIA = [
  {
    tmdbId: 114479,
    mediaType: "tv",
    title: "Vụng Trộm Không Thể Giấu",
    originalTitle: "Hidden Love",
    tagline: "Mối tình ngọt ngào thầm kín của Tang Trĩ và Đoàn Gia Hứa",
    overview:
      "Tang Trĩ từ nhỏ đã thích thầm bạn thân của anh trai cô là Đoàn Gia Hứa. Khi lớn lên và thi đỗ đại học cùng thành phố, họ gặp lại và dần thắt chặt mối quan hệ ngọt ngào.",
    posterPath: "/images/posters/hidden-love.jpg",
    backdropPath: "/vug-trom-khong-the-giau-backdrop.jpg",
    releaseDate: new Date("2023-06-20"),
    runtime: 45,
    genres: ["Romance", "Drama"],
    countries: ["CN"],
    directors: ["Sa Duy Kỳ"],
    actors: ["Triệu Lộ Tư", "Trần Triết Viễn"],
    tmdbRating: 8.7,
  },
  {
    tmdbId: 196454,
    mediaType: "tv",
    title: "Chiếc Bật Lửa Và Váy Công Chúa",
    originalTitle: "Lighter and Princess",
    tagline: "Một tình yêu rực rỡ vượt qua mọi thử thách",
    overview:
      "Câu chuyện về lập trình viên thiên tài Lý Tuân và tiểu thư học bá Chu Vận: gặp nhau ở đại học, trải qua thanh xuân tươi đẹp rồi biến cố chia lìa, sau nhiều năm gặp lại tìm lại công lý và tình yêu.",
    posterPath: "/images/posters/chiec-bat-lua.jpg",
    backdropPath: "/chiec-bat-lua-backdrop.jpg",
    releaseDate: new Date("2022-11-03"),
    runtime: 45,
    genres: ["Romance", "Drama", "Business"],
    countries: ["CN"],
    directors: ["Lưu Tuấn Kiệt"],
    actors: ["Trần Phi Vũ", "Trương Tịnh Nghi"],
    tmdbRating: 8.6,
  },
  {
    tmdbId: 34307,
    mediaType: "tv",
    title: "Thám Tử Lừng Danh Conan",
    originalTitle: "Detective Conan",
    tagline: "Sự thật chỉ có một!",
    overview:
      "Kudo Shinichi bị ép uống thuốc độc APTX 4869, cơ thể thu nhỏ thành trẻ con. Với thân phận Edogawa Conan, cậu âm thầm phá án và truy tìm Tổ chức Áo Đen.",
    posterPath: "/images/posters/conan.jpg",
    backdropPath: "/conan-backdrop.jpg",
    releaseDate: new Date("1996-01-08"),
    runtime: 25,
    genres: ["Animation", "Mystery", "Comedy"],
    countries: ["JP"],
    directors: ["Kenji Kodama"],
    actors: ["Minami Takayama", "Wakana Yamazaki"],
    tmdbRating: 8.9,
  },
  {
    tmdbId: 414906,
    mediaType: "movie",
    title: "Người Dơi",
    originalTitle: "The Batman",
    tagline: "Unmask the truth.",
    overview:
      "Năm thứ hai chống tội phạm ở Gotham, Người Dơi lần theo loạt án mạng nhắm vào quan chức tham nhũng do kẻ giết người hàng loạt Riddler gây ra, dần phơi bày mạng lưới tham nhũng và bóng tối trong quá khứ gia đình mình.",
    posterPath: "/images/posters/the-batman.jpg",
    backdropPath: "/the-batman-backdrop.jpg",
    releaseDate: new Date("2022-03-02"),
    runtime: 176,
    genres: ["Action", "Crime", "Mystery", "Thriller"],
    countries: ["US"],
    directors: ["Matt Reeves"],
    actors: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano"],
    tmdbRating: 7.7,
  },
];

interface SeedWatchItem {
  tmdbId: number;
  status: string;
  personalScore?: number;
  notes?: string;
  favorite?: boolean;
  priority?: number;
  currentSeason?: number;
  currentEpisode?: number;
  totalEpisodes?: number;
  startedAt?: Date;
  completedAt?: Date;
  lastWatchedAt?: Date;
  progressEpisodes?: { season: number; episode: number; note?: string }[];
  sourcePlatform?: string;
  rating?: { overall: number; plot?: number; acting?: number; emotion?: number; ending?: number };
  review?: { content: string; spoilers?: boolean };
  sessions?: { watchedAt: Date; season?: number; episode?: number; minutes?: number }[];
}

interface SeedUser {
  email: string;
  name: string;
  image: string;
  preferences: {
    favGenres: string[];
    favCountries: string[];
    preferTvShows: boolean;
  };
  watchItems: SeedWatchItem[];
  lists: { name: string; description?: string; isPublic: boolean; tmdbIds: number[] }[];
}

async function seedUser(user: SeedUser, passwordHash: string, mediaByTmdb: Map<number, string>) {
  const dbUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {},
    create: {
      email: user.email,
      name: user.name,
      passwordHash,
      image: user.image,
      preferences: {
        create: {
          theme: "dark",
          language: "vi",
          ratingScale: "10",
          favGenres: user.preferences.favGenres,
          favCountries: user.preferences.favCountries,
          preferTvShows: user.preferences.preferTvShows,
          enableAiMood: true,
        },
      },
    },
  });

  for (const wi of user.watchItems) {
    const mediaItemId = mediaByTmdb.get(wi.tmdbId);
    if (!mediaItemId) continue;

    const media = MEDIA.find((m) => m.tmdbId === wi.tmdbId)!;

    const watchItem = await prisma.watchItem.upsert({
      where: { userId_mediaItemId: { userId: dbUser.id, mediaItemId } },
      update: {},
      create: {
        userId: dbUser.id,
        mediaItemId,
        status: wi.status,
        personalScore: wi.personalScore,
        notes: wi.notes,
        favorite: wi.favorite ?? false,
        priority: wi.priority ?? 0,
        currentSeason: wi.currentSeason ?? 1,
        currentEpisode: wi.currentEpisode ?? 0,
        totalEpisodes: wi.totalEpisodes ?? 0,
        startedAt: wi.startedAt,
        completedAt: wi.completedAt,
        lastWatchedAt: wi.lastWatchedAt,
        progress: wi.progressEpisodes
          ? {
              create: wi.progressEpisodes.map((p) => ({
                seasonNumber: p.season,
                episodeNumber: p.episode,
                note: p.note,
              })),
            }
          : undefined,
        sources: wi.sourcePlatform
          ? {
              create: [{ platformName: wi.sourcePlatform, hasVietSub: true, quality: "1080p" }],
            }
          : undefined,
      },
    });

    if (wi.rating) {
      await prisma.rating.upsert({
        where: { userId_watchItemId: { userId: dbUser.id, watchItemId: watchItem.id } },
        update: {},
        create: {
          userId: dbUser.id,
          watchItemId: watchItem.id,
          overallScore: wi.rating.overall,
          plotScore: wi.rating.plot,
          actingScore: wi.rating.acting,
          emotionScore: wi.rating.emotion,
          endingScore: wi.rating.ending,
        },
      });
    }

    if (wi.review) {
      await prisma.review.upsert({
        where: { userId_watchItemId: { userId: dbUser.id, watchItemId: watchItem.id } },
        update: {},
        create: {
          userId: dbUser.id,
          watchItemId: watchItem.id,
          content: wi.review.content,
          spoilers: wi.review.spoilers ?? false,
        },
      });
    }

    if (wi.sessions?.length) {
      const existing = await prisma.watchSession.count({
        where: { userId: dbUser.id, watchItemId: watchItem.id },
      });
      if (existing === 0) {
        await prisma.watchSession.createMany({
          data: wi.sessions.map((s) => ({
            userId: dbUser.id,
            watchItemId: watchItem.id,
            mediaType: media.mediaType,
            watchedAt: s.watchedAt,
            seasonNumber: s.season,
            episodeNumber: s.episode,
            minutesWatched: s.minutes,
          })),
        });
      }
    }
  }

  for (const list of user.lists) {
    const items = list.tmdbIds
      .map((tmdbId, idx) => {
        const mediaItemId = mediaByTmdb.get(tmdbId);
        return mediaItemId ? { mediaItemId, position: idx } : null;
      })
      .filter((x): x is { mediaItemId: string; position: number } => x !== null);

    await prisma.customList.upsert({
      where: { userId_name: { userId: dbUser.id, name: list.name } },
      update: {},
      create: {
        userId: dbUser.id,
        name: list.name,
        description: list.description,
        isPublic: list.isPublic,
        items: { create: items },
      },
    });
  }

  return dbUser;
}

async function main() {
  console.log("🌱 Bắt đầu seed database...");

  console.log("→ Platforms");
  for (const name of PLATFORMS) {
    await prisma.platform.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("→ MediaItems (dùng chung cho mọi user)");
  const mediaByTmdb = new Map<number, string>();
  for (const media of MEDIA) {
    const item = await prisma.mediaItem.upsert({
      where: { tmdbId: media.tmdbId },
      update: {},
      create: media,
    });
    mediaByTmdb.set(media.tmdbId, item.id);
  }

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  console.log("→ User A: user@phimflow.com");
  await seedUser(
    {
      email: "user@phimflow.com",
      name: "Người Dùng Thử",
      image: "https://api.dicebear.com/7.x/adventurer/svg?seed=phimflow",
      preferences: {
        favGenres: ["Romance", "Mystery", "Animation"],
        favCountries: ["CN", "JP", "VN"],
        preferTvShows: true,
      },
      watchItems: [
        {
          tmdbId: 114479, // Hidden Love — đang xem
          status: "watching",
          personalScore: 8.5,
          notes: "Phim siêu ngọt, chemistry đỉnh, Triệu Lộ Tư diễn cực tự nhiên.",
          favorite: true,
          currentSeason: 1,
          currentEpisode: 12,
          totalEpisodes: 25,
          startedAt: new Date("2026-07-01"),
          lastWatchedAt: new Date("2026-07-06"),
          progressEpisodes: [
            { season: 1, episode: 10, note: "Gia Hứa bắt đầu để ý Tang Trĩ" },
            { season: 1, episode: 11, note: "Bắt đầu ngọt ngào" },
            { season: 1, episode: 12 },
          ],
          sourcePlatform: "Netflix",
          rating: { overall: 8.5, plot: 8, acting: 9, emotion: 9, ending: 8 },
          review: { content: "Ngôn tình thanh xuân đáng xem nhất năm, cày một mạch." },
          sessions: [
            { watchedAt: new Date("2026-07-04T20:00:00Z"), season: 1, episode: 10, minutes: 45 },
            { watchedAt: new Date("2026-07-05T21:00:00Z"), season: 1, episode: 11, minutes: 45 },
            { watchedAt: new Date("2026-07-06T21:30:00Z"), season: 1, episode: 12, minutes: 45 },
          ],
        },
        {
          tmdbId: 34307, // Conan — tạm dừng
          status: "paused",
          personalScore: 9.0,
          notes: "Dài quá, vụ án tập 400-420 khá hay.",
          currentSeason: 1,
          currentEpisode: 421,
          totalEpisodes: 1100,
          startedAt: new Date("2025-01-01"),
          lastWatchedAt: new Date("2026-05-10"),
        },
        {
          tmdbId: 414906, // The Batman — muốn xem
          status: "want_to_watch",
          priority: 5,
          notes: "Nghe đồn u tối, để dành cuối tuần.",
        },
      ],
      lists: [
        {
          name: "Ngôn tình cày cuối tuần",
          description: "Danh sách phim ngọt ngào để thư giãn.",
          isPublic: true,
          tmdbIds: [114479, 196454],
        },
      ],
    },
    passwordHash,
    mediaByTmdb,
  );

  console.log("→ User B: user2@phimflow.com");
  await seedUser(
    {
      email: "user2@phimflow.com",
      name: "Minh Anh",
      image: "https://api.dicebear.com/7.x/adventurer/svg?seed=minhanh",
      preferences: {
        favGenres: ["Action", "Crime", "Thriller"],
        favCountries: ["US", "KR"],
        preferTvShows: false,
      },
      watchItems: [
        {
          tmdbId: 196454, // Lighter and Princess — đang xem
          status: "watching",
          personalScore: 8.0,
          notes: "Cốt truyện trưởng thành, hơi bi nhưng cuốn.",
          currentSeason: 1,
          currentEpisode: 20,
          totalEpisodes: 36,
          startedAt: new Date("2026-06-20"),
          lastWatchedAt: new Date("2026-07-07"),
          progressEpisodes: [
            { season: 1, episode: 18 },
            { season: 1, episode: 19 },
            { season: 1, episode: 20 },
          ],
          sourcePlatform: "WeTV",
          sessions: [
            { watchedAt: new Date("2026-07-03T19:00:00Z"), season: 1, episode: 18, minutes: 45 },
            { watchedAt: new Date("2026-07-05T19:30:00Z"), season: 1, episode: 19, minutes: 45 },
            { watchedAt: new Date("2026-07-07T20:00:00Z"), season: 1, episode: 20, minutes: 45 },
          ],
        },
        {
          tmdbId: 414906, // The Batman — đã xem xong
          status: "completed",
          personalScore: 9.0,
          favorite: true,
          currentSeason: 1,
          currentEpisode: 1,
          totalEpisodes: 1,
          startedAt: new Date("2026-07-08"),
          completedAt: new Date("2026-07-08"),
          lastWatchedAt: new Date("2026-07-08"),
          sourcePlatform: "Disney+",
          rating: { overall: 9, plot: 9, acting: 9, emotion: 8, ending: 9 },
          review: {
            content: "Bản Batman noir xuất sắc, Pattinson quá hợp vai. Riddler ám ảnh.",
            spoilers: true,
          },
          sessions: [{ watchedAt: new Date("2026-07-08T20:00:00Z"), minutes: 176 }],
        },
        {
          tmdbId: 34307, // Conan — muốn xem
          status: "want_to_watch",
          priority: 3,
          notes: "Xem thử vài arc nổi tiếng.",
        },
      ],
      lists: [
        {
          name: "Bom tấn Âu Mỹ",
          description: "Phim hành động/tội phạm đáng xem.",
          isPublic: false,
          tmdbIds: [414906],
        },
      ],
    },
    passwordHash,
    mediaByTmdb,
  );

  console.log("✅ Seed hoàn tất!");
  console.log(
    `   Tài khoản demo: user@phimflow.com / user2@phimflow.com — mật khẩu: ${DEV_PASSWORD}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
