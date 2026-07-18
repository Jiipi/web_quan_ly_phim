"use client";

import { useEffect, useState } from "react";
import { Tag, X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  description?: string;
  isCustom: boolean;
}

interface TopicFilterProps {
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
  showAll?: boolean;
}

export function TopicFilter({ selectedTopics, onTopicsChange, showAll = false }: TopicFilterProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const toggleTopic = (topicName: string) => {
    if (selectedTopics.includes(topicName)) {
      onTopicsChange(selectedTopics.filter((n) => n !== topicName));
    } else {
      onTopicsChange([...selectedTopics, topicName]);
    }
  };

  const clearTopics = () => {
    onTopicsChange([]);
  };

  const getTopicByName = (name: string) => topics.find((t) => t.name === name);

  // Group topics
  const predefined = topics.filter((t) => !t.isCustom);
  const custom = topics.filter((t) => t.isCustom);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 h-9",
            selectedTopics.length > 0 && "border-primary bg-primary/10"
          )}
        >
          <Tag className="w-4 h-4" />
          Chủ đề
          {selectedTopics.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {selectedTopics.length}
            </Badge>
          )}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Lọc theo Chủ đề</span>
            {selectedTopics.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTopics}
                className="h-7 text-xs"
              >
                Xóa lọc
              </Button>
            )}
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
                    const isSelected = selectedTopics.includes(topic.name);
                    return (
                      <button
                        key={topic.id}
                        onClick={() => toggleTopic(topic.name)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:border-primary/50 hover:bg-surface"
                        )}
                      >
                        {topic.icon && <span>{topic.icon}</span>}
                        {topic.name}
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
                      const isSelected = selectedTopics.includes(topic.name);
                      return (
                        <button
                          key={topic.id}
                          onClick={() => toggleTopic(topic.name)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary/50 hover:bg-surface"
                          )}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: topic.color }}
                          />
                          {topic.name}
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

// Selected topics chips bar
export function TopicChips({
  selectedTopics,
  onRemove,
}: {
  selectedTopics: string[];
  onRemove: (name: string) => void;
}) {
  if (selectedTopics.length === 0) return null;

  // Get topic data
  const topicData: Record<string, { color: string; icon?: string }> = {
    "Anime": { color: "#7C3AED", icon: "🎌" },
    "Hoạt hình": { color: "#2563EB", icon: "🎨" },
    "Trung Quốc": { color: "#DC2626", icon: "🇨🇳" },
    "Hàn Quốc": { color: "#0D9488", icon: "🇰🇷" },
    "Việt Nam": { color: "#CA8A04", icon: "🇻🇳" },
    "Nhật Bản": { color: "#DB2777", icon: "🇯🇵" },
    "Mỹ": { color: "#2563EB", icon: "🇺🇸" },
    "Thái Lan": { color: "#7C3AED", icon: "🇹🇭" },
    "Ấn Độ": { color: "#EA580C", icon: "🇮🇳" },
    "Drama": { color: "#16A34A", icon: "🎭" },
    "Hành động": { color: "#DC2626", icon: "💥" },
    "Kinh dị": { color: "#7C3AED", icon: "👻" },
    "Hài": { color: "#CA8A04", icon: "😂" },
    "Lãng mạn": { color: "#DB2777", icon: "❤️" },
    "Khoa học viễn tưởng": { color: "#2563EB", icon: "🚀" },
    "Giả tưởng": { color: "#7C3AED", icon: "🧙" },
    "Chiến tranh": { color: "#6B7280", icon: "⚔️" },
    "Phiêu lưu": { color: "#16A34A", icon: "🗺️" },
    "Trinh thám": { color: "#0D9488", icon: "🔍" },
    "Documentary": { color: "#6B7280", icon: "📽️" },
    "Kids": { color: "#CA8A04", icon: "👶" },
  };

  return (
    <div className="flex flex-wrap gap-2">
      {selectedTopics.map((name) => {
        const data = topicData[name] || { color: "#7C3AED" };
        return (
          <Badge
            key={name}
            variant="secondary"
            className="gap-1.5 pl-2 pr-1.5 py-1 h-7"
            style={{
              backgroundColor: `${data.color}20`,
              borderColor: data.color,
              color: data.color,
            }}
          >
            {data.icon && <span>{data.icon}</span>}
            {name}
            <button
              onClick={() => onRemove(name)}
              className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        );
      })}
    </div>
  );
}
