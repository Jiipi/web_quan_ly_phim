"use client";

import { useEffect, useState } from "react";
import { Tag, X, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isCustom: boolean;
}

interface TopicAssignmentProps {
  watchItemId: string;
  currentTopics: string[]; // Array of topic names
  onUpdate?: () => void;
}

export function TopicAssignment({ watchItemId, currentTopics, onUpdate }: TopicAssignmentProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchTopics = async () => {
    setLoading(true);
    const res = await api.get<Topic[]>("/api/topics");
    if (res.success && res.data) {
      setTopics(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchTopics();
    }
  }, [open]);

  const handleToggle = async (topicName: string) => {
    setSaving(topicName);
    const isAssigned = currentTopics.includes(topicName);

    try {
      if (isAssigned) {
        await api.delete("/api/topics", { watchItemId, topicName });
      } else {
        await api.post("/api/topics", { watchItemId, topicName });
      }
      onUpdate?.();
    } catch (e) {
      console.error("Failed to toggle topic:", e);
    } finally {
      setSaving(null);
    }
  };

  const predefined = topics.filter((t) => !t.isCustom);
  const custom = topics.filter((t) => t.isCustom);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 px-2"
          title="Gán chủ đề"
        >
          <Tag className="w-3.5 h-3.5" />
          <span className="text-xs">Chủ đề</span>
          {currentTopics.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {currentTopics.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Gán Chủ đề</span>
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
          ) : (
            <>
              {/* Predefined topics */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Chủ đề có sẵn
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {predefined.map((topic) => {
                    const isAssigned = currentTopics.includes(topic.name);
                    const isSaving = saving === topic.name;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => handleToggle(topic.name)}
                        disabled={isSaving}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                          isAssigned
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary/50 hover:bg-surface",
                          isSaving && "opacity-50 cursor-wait"
                        )}
                      >
                        {topic.icon && <span>{topic.icon}</span>}
                        {topic.name}
                        {isSaving ? (
                          <span className="ml-1">...</span>
                        ) : isAssigned ? (
                          <Check className="w-3 h-3 ml-1" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom topics */}
              {custom.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Tags tùy chỉnh
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {custom.map((topic) => {
                      const isAssigned = currentTopics.includes(topic.name);
                      const isSaving = saving === topic.name;
                      return (
                        <button
                          key={topic.id}
                          onClick={() => handleToggle(topic.name)}
                          disabled={isSaving}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                            isAssigned
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary/50 hover:bg-surface",
                            isSaving && "opacity-50 cursor-wait"
                          )}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: topic.color }}
                          />
                          {topic.name}
                          {isSaving ? (
                            <span className="ml-1">...</span>
                          ) : isAssigned ? (
                            <Check className="w-3 h-3 ml-1" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
