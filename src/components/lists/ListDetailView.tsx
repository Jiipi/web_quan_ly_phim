"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2, Globe, Lock, Loader2, Plus } from "lucide-react";
import { PosterImage } from "@/components/shared/PosterImage";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useLibrary } from "@/lib/use-library";
import { api } from "@/lib/api";

interface ListItem {
  mediaItemId: string;
  position: number;
  tmdbId: number;
  title: string;
  mediaType: string;
  posterPath: string | null;
}

interface ListDetail {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  isOwner: boolean;
  items: ListItem[];
}

export function ListDetailView({ listId }: { listId: string }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const { confirm } = useConfirm();
  const { items: libraryItems } = useLibrary();

  const [detail, setDetail] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [addId, setAddId] = useState("");

  function reload() {
    api.get<ListDetail>(`/api/lists/${listId}`).then((res) => {
      if (res.success && res.data) setDetail(res.data);
      else setNotFound(true);
    });
  }

  useEffect(() => {
    let active = true;
    api.get<ListDetail>(`/api/lists/${listId}`).then((res) => {
      if (!active) return;
      if (res.success && res.data) setDetail(res.data);
      else setNotFound(true);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [listId]);

  async function addItem() {
    if (!addId) return;
    const res = await api.post(`/api/lists/${listId}/items`, { mediaItemId: addId });
    if (res.success) {
      setAddId("");
      success("Đã thêm phim vào danh sách.");
      reload();
    } else {
      toastError(res.error ?? "Không thể thêm phim.");
    }
  }

  async function removeItem(mediaItemId: string) {
    const res = await api.delete(`/api/lists/${listId}/items?mediaItemId=${mediaItemId}`);
    if (res.success) {
      success("Đã gỡ phim.");
      reload();
    } else {
      toastError(res.error ?? "Không thể gỡ phim.");
    }
  }

  async function move(index: number, dir: -1 | 1) {
    if (!detail) return;
    const next = [...detail.items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setDetail({ ...detail, items: next }); // cập nhật lạc quan
    const res = await api.patch(`/api/lists/${listId}/items`, {
      orderedMediaItemIds: next.map((i) => i.mediaItemId),
    });
    if (!res.success) {
      toastError("Không thể đổi thứ tự.");
      reload();
    }
  }

  async function togglePublic() {
    if (!detail) return;
    const res = await api.patch(`/api/lists/${listId}`, { isPublic: !detail.isPublic });
    if (res.success) {
      setDetail({ ...detail, isPublic: !detail.isPublic });
      success(detail.isPublic ? "Đã chuyển sang riêng tư." : "Đã công khai danh sách.");
    } else {
      toastError(res.error ?? "Không thể cập nhật.");
    }
  }

  async function deleteList() {
    if (!detail) return;
    const ok = await confirm({
      title: "Xoá danh sách?",
      message: `Xoá "${detail.name}"? Không thể hoàn tác.`,
      danger: true,
      confirmLabel: "Xoá",
    });
    if (!ok) return;
    const res = await api.delete(`/api/lists/${listId}`);
    if (res.success) {
      success("Đã xoá danh sách.");
      router.push("/lists");
    } else {
      toastError(res.error ?? "Không thể xoá.");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <EmptyState
        title="Không tìm thấy danh sách"
        description="Danh sách không tồn tại hoặc bạn không có quyền xem."
      />
    );
  }

  const inListIds = new Set(detail.items.map((i) => i.mediaItemId));
  const addable = libraryItems.filter((i) => !inListIds.has(i.mediaItem.id));

  return (
    <div className="flex animate-fade-in-up flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-white/5 pb-4">
        <Link href="/lists" className="text-xs font-semibold text-secondary hover:underline">
          ← Tất cả danh sách
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{detail.name}</h1>
          {detail.isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={togglePublic}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-white/10"
              >
                {detail.isPublic ? (
                  <>
                    <Globe size={13} /> Công khai
                  </>
                ) : (
                  <>
                    <Lock size={13} /> Riêng tư
                  </>
                )}
              </button>
              <button
                onClick={deleteList}
                aria-label="Xoá danh sách"
                className="rounded-full border border-white/10 bg-white/5 p-2 text-text-muted transition-colors hover:bg-dropped/10 hover:text-dropped"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        {detail.description && <p className="text-sm text-text-secondary">{detail.description}</p>}
      </div>

      {/* Thêm phim từ thư viện (chủ sở hữu) */}
      {detail.isOwner && (
        <div className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <label htmlFor="add-media" className="text-xs font-semibold text-text-secondary">
            Thêm từ thư viện:
          </label>
          <select
            id="add-media"
            value={addId}
            onChange={(e) => setAddId(e.target.value)}
            className="flex-1 rounded-lg border border-white/8 bg-card p-2 text-sm text-text focus:border-primary focus:outline-none"
          >
            <option value="">-- Chọn phim --</option>
            {addable.map((i) => (
              <option key={i.mediaItem.id} value={i.mediaItem.id}>
                {i.mediaItem.title}
              </option>
            ))}
          </select>
          <button
            onClick={addItem}
            disabled={!addId}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-hover disabled:opacity-60"
          >
            <Plus size={14} /> Thêm
          </button>
        </div>
      )}

      {detail.items.length === 0 ? (
        <EmptyState
          title="Danh sách trống"
          description="Thêm phim từ thư viện của bạn để bắt đầu."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {detail.items.map((item, index) => (
            <div key={item.mediaItemId} className="glass-card flex items-center gap-3 p-3">
              <span className="w-5 text-center font-mono text-xs text-text-muted">{index + 1}</span>
              <div className="h-16 w-11 shrink-0 overflow-hidden rounded">
                <PosterImage src={item.posterPath} alt={item.title} />
              </div>
              <Link
                href={`/${item.mediaType === "tv" ? "show" : "movie"}/${item.tmdbId}`}
                className="flex-1 text-sm font-semibold text-text hover:text-primary"
              >
                {item.title}
              </Link>
              {detail.isOwner && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Di chuyển lên"
                    className="rounded p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === detail.items.length - 1}
                    aria-label="Di chuyển xuống"
                    className="rounded p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => removeItem(item.mediaItemId)}
                    aria-label={`Gỡ ${item.title}`}
                    className="rounded p-1.5 text-text-muted transition-colors hover:bg-dropped/10 hover:text-dropped"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
