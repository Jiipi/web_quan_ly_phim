import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, User } from "lucide-react";
import type { Message } from "./useChatStream";

interface ChatMessageProps {
  message: Message;
}

// Simple custom renderer to parse basic Markdown formatting
function formatContent(text: string) {
  if (!text) return "";

  // Split into lines
  const lines = text.split("\n");

  return lines.map((line, idx) => {
    let processed = line;

    // Check for lists
    const isBulletList = line.trim().startsWith("-") || line.trim().startsWith("*");
    const isNumberedList = /^\d+\.\s/.test(line.trim());

    if (isBulletList) {
      processed = line.replace(/^[\s-*]+/, "• ");
    }

    // Bold text (**bold**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(processed)) !== null) {
      if (match.index > lastIndex) {
        parts.push(processed.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-bold text-text">
          {match[1]}
        </strong>,
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < processed.length) {
      parts.push(processed.substring(lastIndex));
    }

    const element = parts.length > 0 ? parts : processed;

    if (isBulletList || isNumberedList) {
      return (
        <div key={idx} className="pl-4 py-0.5 text-xs text-text-secondary leading-relaxed">
          {element}
        </div>
      );
    }

    return (
      <p key={idx} className="text-xs leading-relaxed text-text-secondary min-h-[1rem]">
        {element}
      </p>
    );
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-1 items-start animate-in fade-in slide-in-from-bottom-2 duration-200",
        isBot ? "justify-start" : "justify-end",
      )}
    >
      {isBot && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary shadow-[0_0_12px_rgba(239,68,68,0.1)]">
          <Sparkles size={14} className="fill-current animate-pulse" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm border",
          isBot
            ? "rounded-tl-none bg-card border-border text-text"
            : "rounded-tr-none bg-primary/10 border-primary/20 text-text",
        )}
      >
        <div className="space-y-1.5">{formatContent(message.content)}</div>
      </div>

      {!isBot && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-white/5 text-text-secondary">
          <User size={14} />
        </div>
      )}
    </div>
  );
}
