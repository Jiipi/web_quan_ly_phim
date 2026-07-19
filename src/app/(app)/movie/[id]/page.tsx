import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { getMediaDetail, loadWatchInitial } from "@/lib/media-detail";
import { DetailView } from "@/components/detail/DetailView";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const detail = await getMediaDetail(Number(id), "movie");
  if (!detail) return { title: "Không tìm thấy phim — PhimFlow" };

  const title = `${detail.title} (${detail.releaseDate ? new Date(detail.releaseDate).getFullYear() : ""}) — PhimFlow`;
  const description = detail.overview
    ? detail.overview.slice(0, 160) + "..."
    : "Quản lý và cập nhật tiến độ xem phim cá nhân trên PhimFlow.";
  const image = detail.posterPath
    ? `https://image.tmdb.org/t/p/w500${detail.posterPath}`
    : "/favicon.ico";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.movie",
      images: [
        {
          url: image,
          width: 500,
          height: 750,
          alt: detail.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function MoviePage({ params }: Params) {
  const { id } = await params;
  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId)) notFound();

  const detail = await getMediaDetail(tmdbId, "movie");
  if (!detail) notFound();

  const userId = await getCurrentUserId();
  const initial = await loadWatchInitial(userId, tmdbId);

  return <DetailView detail={detail} initial={initial} />;
}
