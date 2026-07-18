import { http, HttpResponse } from "msw";

/**
 * Handler MSW dùng chung cho component/integration test.
 * Mặc định mock các endpoint nội bộ của app; test riêng có thể override bằng server.use(...).
 */
export const handlers = [
  http.get("*/api/tmdb/search", ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const all = [
      {
        id: 414906,
        title: "Người Dơi",
        originalTitle: "The Batman",
        mediaType: "movie",
        overview: "",
        posterPath: "/images/posters/the-batman.jpg",
        backdropPath: null,
        releaseDate: "2022-03-02",
        rating: 7.7,
      },
    ];
    const results = all.filter(
      (m) => m.title.toLowerCase().includes(q) || m.originalTitle.toLowerCase().includes(q),
    );
    return HttpResponse.json(results);
  }),

  http.get("*/api/library", () => HttpResponse.json([])),
];
