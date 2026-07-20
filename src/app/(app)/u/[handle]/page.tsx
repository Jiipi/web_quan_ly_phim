"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, User as UserIcon } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { FollowButton } from "@/components/community/FollowButton";
import { PostList } from "@/components/community/PostList";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { formatCount } from "@/lib/community";
import type { PublicProfile } from "@/components/community/types";

export default function PublicProfilePage() {
  const params = useParams();
  const { t } = useT();
  const handle = params.handle as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    api.get<{ user: PublicProfile }>(`/api/users/${handle}`).then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        setProfile(res.data.user);
      } else if (res.success === false && res.error?.toLowerCase().includes("không tìm")) {
        setNotFound(true);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [handle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <UserIcon size={32} className="mx-auto text-white/30" />
        <p className="mt-3 text-sm text-white/60">{t("community.profile.not-found")}</p>
        <Link
          href="/community"
          className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ArrowLeft size={12} /> Quay lại Cộng đồng
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 animate-fade-in-up">
      <Link
        href="/community"
        className="flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft size={14} /> Quay lại
      </Link>

      <header className="glass-card flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
        <UserAvatar src={profile.image} name={profile.name ?? "U"} size="xl" glow />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="text-xl font-bold text-white">{profile.name ?? "Người dùng"}</h1>
          {profile.handle && (
            <p className="mt-0.5 font-mono text-xs text-white/50">@{profile.handle}</p>
          )}
          {profile.bio && <p className="mt-3 text-sm text-white/70">{profile.bio}</p>}
          <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
            <Stat label={t("community.profile.followers")} value={profile.followersCount} />
            <Stat label={t("community.profile.following-count")} value={profile.followingCount} />
            <Stat label={t("community.profile.posts")} value={profile.postsCount} />
          </div>
        </div>
        {!profile.isMe && (
          <FollowButton
            handle={profile.handle ?? ""}
            initialFollowing={profile.isFollowing}
            initialFollowersCount={profile.followersCount}
            isMe={false}
            onChange={(following) => {
              setProfile((p) =>
                p
                  ? {
                      ...p,
                      isFollowing: following,
                      followersCount: p.followersCount + (following ? 1 : -1),
                    }
                  : p,
              );
            }}
          />
        )}
      </header>

      <section>
        <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-white/60">
          {t("community.profile.posts")} ({profile.postsCount})
        </h2>
        <PostList authorId={profile.id} pollIntervalMs={10000} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-bold text-white">{formatCount(value)}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">{label}</p>
    </div>
  );
}
