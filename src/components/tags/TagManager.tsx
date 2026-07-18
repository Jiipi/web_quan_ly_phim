"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  color: string;
  _count?: { mediaTags: number };
}

interface TagManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagChange?: () => void;
}

const PRESET_COLORS = [
  "#DC2626", // Red
  "#EA580C", // Orange
  "#CA8A04", // Yellow
  "#16A34A", // Green
  "#0D9488", // Teal
  "#2563EB", // Blue
  "#7C3AED", // Purple
  "#DB2777", // Pink
  "#6B7280", // Gray
];

export function TagManager({ open, onOpenChange, onTagChange }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);

  const fetchTags = async () => {
    setLoading(true);
    const res = await api.get<Tag[]>("/api/tags");
    if (res.success && res.data) {
      setTags(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchTags();
    }
  }, [open]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    const res = await api.post("/api/tags", { name: newTagName.trim(), color: newTagColor });
    if (res.success) {
      setNewTagName("");
      setNewTagColor(PRESET_COLORS[0]);
      fetchTags();
      onTagChange?.();
    }
  };

  const handleUpdateTag = async (id: string) => {
    if (!editName.trim()) return;

    const res = await api.patch(`/api/tags/${id}`, { name: editName.trim(), color: editColor });
    if (res.success) {
      setEditingId(null);
      fetchTags();
      onTagChange?.();
    }
  };

  const handleDeleteTag = async (id: string) => {
    const res = await api.delete(`/api/tags/${id}`);
    if (res.success) {
      fetchTags();
      onTagChange?.();
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quản lý Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new tag */}
          <div className="flex gap-2">
            <Input
              placeholder="Tên tag mới..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
              className="flex-1"
            />
            <div className="flex gap-1">
              {PRESET_COLORS.slice(0, 4).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform hover:scale-110",
                    newTagColor === color && "ring-2 ring-white ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer"
              />
            </div>
            <Button size="sm" onClick={handleCreateTag} disabled={!newTagName.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Tag list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <p className="text-text-secondary text-sm text-center py-4">Đang tải...</p>
            ) : tags.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-4">
                Chưa có tag nào. Tạo tag đầu tiên!
              </p>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-surface/50 hover:bg-surface transition-colors"
                >
                  {editingId === tag.id ? (
                    <>
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: editColor }}
                      />
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateTag(tag.id);
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <div className="flex gap-1">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditColor(color)}
                            className={cn(
                              "w-5 h-5 rounded-full transition-transform hover:scale-110",
                              editColor === color && "ring-1 ring-white",
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleUpdateTag(tag.id)}>
                        Lưu
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditing}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1 text-sm">{tag.name}</span>
                      {tag._count && tag._count.mediaTags > 0 && (
                        <span className="text-xs text-text-secondary">
                          {tag._count.mediaTags} phim
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(tag)}
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTag(tag.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
