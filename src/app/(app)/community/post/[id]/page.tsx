"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PostCard } from "@/components/community/PostCard";
import { CommentList } from "@/components/community/CommentList";
import { api } from "@/lib/api";
import type { PostItem } from "@/components/community/types";

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [post, setPost] = useState<PostItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get<{ post: PostItem }>(`/api/community/posts/${id}`).then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        setPost(res.data.post);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <p className="text-sm text-white/60">Không tìm thấy bài viết.</p>
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
    <div className="mx-auto flex max-w-2xl flex-col gap-4 animate-fade-in-up">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft size={14} /> Quay lại
      </button>
      <PostCard
        post={post}
        showDetailLink={false}
        onChange={setPost}
        onDelete={() => router.push("/community")}
      />
      <div className="glass-card p-4">
        <h2 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-white/60">
          Bình luận ({post.commentCount})
        </h2>
        <CommentList
          postId={post.id}
          onCountChange={(delta) =>
            setPost((prev) => (prev ? { ...prev, commentCount: prev.commentCount + delta } : prev))
          }
        />
      </div>
    </div>
  );
}
