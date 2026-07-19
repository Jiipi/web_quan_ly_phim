import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles, User } from "lucide-react";
import type { Message } from "./useChatStream";

interface ChatMessageProps {
  message: Message;
}

function parseBold(text: string): React.ReactNode[] {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.substring(lastIndex, match.index));
    }
    result.push(
      <strong key={match.index} className="font-bold text-text">
        {match[1]}
      </strong>,
    );
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
}

function parseInlineStyles(text: string): React.ReactNode[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) {
      result.push(...parseBold(textBefore));
    }

    const label = match[1];
    const url = match[2];
    const isInternal = url.startsWith("/") || url.startsWith("./") || url.startsWith("../");

    if (isInternal) {
      result.push(
        <Link
          key={match.index}
          href={url}
          className="text-primary hover:text-primary-hover font-semibold underline transition-colors"
        >
          {label}
        </Link>,
      );
    } else {
      result.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-hover font-semibold underline transition-colors"
        >
          {label}
        </a>,
      );
    }

    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(...parseBold(text.substring(lastIndex)));
  }

  return result;
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

    const element = parseInlineStyles(processed);

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
