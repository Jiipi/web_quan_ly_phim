"use client";

import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  color: string;
  _count?: { mediaTags: number };
}

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ selectedTags, onTagsChange }: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const clearTags = () => {
    onTagsChange([]);
  };

  const getTagById = (id: string) => tags.find((t) => t.id === id);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 h-9",
            selectedTags.length > 0 && "border-primary bg-primary/10"
          )}
        >
          <Tag className="w-4 h-4" />
          Tags
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {selectedTags.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Lọc theo Tags</span>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTags}
                className="h-7 text-xs"
              >
                Xóa lọc
              </Button>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-text-secondary text-center py-2">Đang tải...</p>
          ) : tags.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-2">
              Chưa có tag nào
            </p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                      isSelected
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-surface"
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-left">{tag.name}</span>
                    {tag._count && tag._count.mediaTags > 0 && (
                      <span className="text-xs text-text-secondary">
                        {tag._count.mediaTags}
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-primary">✓</span>
                    )}
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

// Chip hiển thị tag đã chọn
export function TagChip({
  tagId,
  tagName,
  tagColor,
  onRemove,
}: {
  tagId: string;
  tagName: string;
  tagColor: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className="gap-1.5 pl-2 pr-1 py-1 h-7"
      style={{
        backgroundColor: `${tagColor}20`,
        borderColor: tagColor,
        color: tagColor,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: tagColor }}
      />
      {tagName}
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
      >
        <span className="sr-only">Xóa</span>
        ×
      </button>
    </Badge>
  );
}
