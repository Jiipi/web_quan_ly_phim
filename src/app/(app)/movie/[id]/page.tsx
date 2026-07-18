import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { getMediaDetail, loadWatchInitial } from "@/lib/media-detail";
import { DetailView } from "@/components/detail/DetailView";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const detail = await getMediaDetail(Number(id), "movie");
  return { title: detail ? `${detail.title} — PhimFlow` : "Phim — PhimFlow" };
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
