"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ListPlus, Globe, Lock, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/shared/EmptyState";

interface ListSummary {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  itemCount: number;
}

export default function ListsPage() {
  const { success, error: toastError } = useToast();
  const { confirm } = useConfirm();
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  function loadLists() {
    api.get<ListSummary[]>("/api/lists").then((res) => {
      setLists(res.success && res.data ? res.data : []);
      setLoading(false);
    });
  }

  useEffect(() => {
    let active = true;
    api.get<ListSummary[]>("/api/lists").then((res) => {
      if (!active) return;
      setLists(res.success && res.data ? res.data : []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function createList(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const res = await api.post("/api/lists", { name: name.trim(), isPublic });
    setCreating(false);
    if (res.success) {
      setName("");
      setIsPublic(false);
      success("Đã tạo danh sách.");
      loadLists();
    } else {
      toastError(res.error ?? "Không thể tạo danh sách.");
    }
  }

  async function removeList(list: ListSummary) {
    const ok = await confirm({
      title: "Xoá danh sách?",
      message: `Xoá "${list.name}" và toàn bộ phim trong đó. Không thể hoàn tác.`,
      danger: true,
      confirmLabel: "Xoá",
    });
    if (!ok) return;
    const res = await api.delete(`/api/lists/${list.id}`);
    if (res.success) {
      success("Đã xoá danh sách.");
      loadLists();
    } else {
      toastError(res.error ?? "Không thể xoá.");
    }
  }

  return (
    <div className="flex animate-fade-in-up flex-col gap-6">
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Danh sách của tôi</h1>
        <p className="mt-1 text-xs text-text-secondary">
          Tạo bộ sưu tập phim theo chủ đề và chia sẻ công khai nếu muốn.
        </p>
      </div>

      {/* Tạo mới */}
      <form
        onSubmit={createList}
        className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Tên danh sách mới..."
          aria-label="Tên danh sách mới"
          className="flex-1 rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
        />
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="accent-primary"
          />
          Công khai
        </label>
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-glow-primary transition-all hover:bg-primary-hover disabled:opacity-60"
        >
          <ListPlus size={14} /> Tạo danh sách
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={22} className="animate-spin text-primary" />
        </div>
      ) : lists.length === 0 ? (
        <EmptyState
          title="Chưa có danh sách nào"
          description="Tạo danh sách đầu tiên để nhóm các phim theo chủ đề của bạn."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="glass-card group relative flex flex-col gap-2 p-4 transition-all hover:border-white/15"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`/lists/${list.id}`} className="flex-1">
                  <h3 className="font-bold text-text group-hover:text-primary-light">
                    {list.name}
                  </h3>
                </Link>
                <button
                  onClick={() => removeList(list)}
                  aria-label={`Xoá danh sách ${list.name}`}
                  className="rounded p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-dropped"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {list.description && (
                <p className="line-clamp-2 text-xs text-text-secondary">{list.description}</p>
              )}
              <div className="mt-auto flex items-center justify-between pt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  {list.isPublic ? (
                    <>
                      <Globe size={12} /> Công khai
                    </>
                  ) : (
                    <>
                      <Lock size={12} /> Riêng tư
                    </>
                  )}
                </span>
                <Link
                  href={`/lists/${list.id}`}
                  className="flex items-center gap-0.5 font-semibold text-secondary hover:underline"
                >
                  {list.itemCount} phim <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
