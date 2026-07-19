import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (text: string) => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const { t } = useT();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize input height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (promptKey: string) => {
    if (isStreaming) return;
    const text = t(promptKey);
    onSend(text);
  };

  const quickPrompts = [
    { key: "chat.suggest.today" },
    { key: "chat.suggest.korean" },
    { key: "chat.suggest.chill" },
    { key: "chat.suggest.similar" },
  ];

  return (
    <div className="flex flex-col gap-2 border-t border-border bg-card/50 p-3">
      {/* Quick Prompts */}
      {!isStreaming && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPrompt(p.key)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-white/5 px-2.5 py-1 text-[10px] font-medium text-text-secondary transition-all hover:bg-white/10 hover:text-text hover:border-border-hover active:scale-95"
            >
              <Sparkles size={8} className="text-secondary" />
              {t(p.key)}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="relative flex items-end gap-2 bg-white/5 border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 rounded-xl px-3 py-1.5 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.placeholder")}
          disabled={isStreaming}
          className="flex-1 resize-none bg-transparent py-1 text-xs text-text placeholder-text-muted focus:outline-none disabled:cursor-not-allowed max-h-[120px] leading-relaxed scrollbar-none"
        />

        <Button
          size="icon"
          variant="ghost"
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="h-7 w-7 shrink-0 text-primary hover:text-primary-hover hover:bg-primary/10 rounded-lg active:scale-95 transition-transform"
        >
          <Send size={14} />
        </Button>
      </div>
    </div>
  );
}
