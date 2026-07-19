"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagAssignmentProps {
  watchItemId: string;
  currentTags: Array<{ tagId: string; tag: Tag }>;
  onUpdate?: () => void;
}

export function TagAssignment({ watchItemId, currentTags, onUpdate }: TagAssignmentProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  const currentTagIds = currentTags.map((mt) => mt.tagId);

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
      const timer = setTimeout(() => {
        void fetchTags();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleToggle = async (tagId: string) => {
    setAssigning(tagId);
    const isAssigned = currentTagIds.includes(tagId);

    try {
      if (isAssigned) {
        await api.delete("/api/media-tags", { watchItemId, tagId });
      } else {
        await api.post("/api/media-tags", { watchItemId, tagId });
      }
      onUpdate?.();
    } catch (e) {
      console.error("Failed to toggle tag:", e);
    } finally {
      setAssigning(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2" title="Gán tags">
          <Tag className="w-3.5 h-3.5" />
          <span className="text-xs">Tags</span>
          {currentTags.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {currentTags.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Gán Tags</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-7 text-xs"
            >
              Xong
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-text-secondary text-center py-4">Đang tải...</p>
          ) : tags.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">
              Chưa có tag nào. Tạo tag trong thư viện.
            </p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {tags.map((tag) => {
                const isAssigned = currentTagIds.includes(tag.id);
                const isLoading = assigning === tag.id;
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleToggle(tag.id)}
                    disabled={isLoading}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                      isAssigned ? "bg-primary/20 text-primary" : "hover:bg-surface",
                      isLoading && "opacity-50 cursor-wait",
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-left">{tag.name}</span>
                    {isLoading ? (
                      <span className="text-xs">...</span>
                    ) : isAssigned ? (
                      <span className="text-primary text-xs">✓</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
