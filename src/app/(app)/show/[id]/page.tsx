import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { getMediaDetail, loadWatchInitial } from "@/lib/media-detail";
import { DetailView } from "@/components/detail/DetailView";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const detail = await getMediaDetail(Number(id), "tv");
  return { title: detail ? `${detail.title} — PhimFlow` : "Phim bộ — PhimFlow" };
}

export default async function ShowPage({ params }: Params) {
  const { id } = await params;
  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId)) notFound();

  const detail = await getMediaDetail(tmdbId, "tv");
  if (!detail) notFound();

  const userId = await getCurrentUserId();
  const initial = await loadWatchInitial(userId, tmdbId);

  return <DetailView detail={detail} initial={initial} />;
}
