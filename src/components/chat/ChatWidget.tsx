"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Sparkles, Plus, History, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n";
import { useChatStream } from "./useChatStream";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { api } from "@/lib/api";

interface ChatSessionInfo {
  id: string;
  title: string | null;
  updatedAt: string;
}

export function ChatWidget() {
  const { t } = useT();
  const confirmDialog = useConfirm();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionInfo[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const { messages, isStreaming, error, sessionId, sendMessage, loadSession, clearChat } =
    useChatStream();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Load chat sessions when history is opened
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await api.get<{ sessions: ChatSessionInfo[] }>("/api/ai/chat/history");
      if (res.success && res.data) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      const timer = setTimeout(() => {
        void fetchSessions();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [showHistory]);

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirmDialog.confirm({
      title: t("chat.delete-confirm"),
      danger: true,
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
    });

    if (!ok) return;

    try {
      const res = await api.delete(`/api/ai/chat/history?sessionId=${id}`);
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (sessionId === id) {
          clearChat();
        }
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const handleSelectSession = async (id: string) => {
    await loadSession(id);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    clearChat();
    setShowHistory(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex h-[580px] w-[420px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card/90 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md sm:bottom-24"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-secondary/30 bg-secondary/10 text-secondary shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                  <Sparkles size={14} className="fill-current animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold tracking-tight text-white flex items-center gap-1.5">
                    {t("chat.title")}
                    <span className="rounded-full bg-secondary/15 px-1.5 py-0.5 text-[8px] font-bold text-secondary border border-secondary/20">
                      Beta
                    </span>
                  </h3>
                  <p className="text-[10px] text-text-muted">Online</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleNewChat}
                  title={t("chat.new")}
                  className="h-7 w-7 text-text-secondary hover:text-text rounded-lg"
                >
                  <Plus size={14} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowHistory(!showHistory)}
                  title={t("chat.history")}
                  className={`h-7 w-7 rounded-lg transition-colors ${
                    showHistory
                      ? "text-primary bg-primary/10"
                      : "text-text-secondary hover:text-text"
                  }`}
                >
                  <History size={14} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 text-text-secondary hover:text-text rounded-lg"
                >
                  <X size={14} />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="relative flex-1 overflow-hidden">
              {/* History Overlay */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 250 }}
                    className="absolute inset-0 z-20 flex flex-col border-l border-border bg-card"
                  >
                    <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <History size={12} />
                        {t("chat.history")}
                      </h4>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setShowHistory(false)}
                        className="h-6 w-6 text-text-secondary hover:text-text"
                      >
                        <X size={12} />
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {loadingSessions ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                      ) : sessions.length === 0 ? (
                        <p className="text-center text-xs text-text-muted py-12">
                          Chưa có hội thoại nào.
                        </p>
                      ) : (
                        sessions.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => handleSelectSession(s.id)}
                            className={`group flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all hover:scale-[1.01] ${
                              sessionId === s.id
                                ? "border-primary bg-primary/10"
                                : "border-border bg-card/50 hover:border-border-hover hover:bg-card"
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="truncate text-xs font-semibold text-text">
                                {s.title || "Hội thoại không tiêu đề"}
                              </p>
                              <p className="text-[10px] text-text-muted mt-0.5">
                                {new Date(s.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => handleDeleteSession(s.id, e)}
                              className="h-7 w-7 text-text-muted hover:text-dropped hover:bg-dropped/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Messages */}
              <div className="h-full overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-transparent to-card/20">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/5 text-secondary shadow-[0_0_24px_rgba(239,68,68,0.1)]">
                      <Sparkles size={24} className="fill-current animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-text">Trò chuyện với CineBot</h4>
                      <p className="max-w-[280px] text-[11px] text-text-muted leading-relaxed">
                        {t("chat.welcome")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isStreaming && messages[messages.length - 1]?.content === "" && (
                      <div className="flex items-center gap-1.5 text-text-secondary pl-14 text-[10px]">
                        <Loader2 size={10} className="animate-spin text-secondary" />
                        <span>{t("chat.typing")}</span>
                      </div>
                    )}
                  </>
                )}
                {error && (
                  <div className="rounded-xl border border-dropped/30 bg-dropped/10 p-3 text-[10px] text-dropped text-center">
                    ⚠️ {error}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Footer */}
            <ChatInput onSend={sendMessage} isStreaming={isStreaming} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_16px_rgba(239,68,68,0.4)] hover:bg-primary-hover active:scale-95 transition-all duration-200 border border-primary-hover relative group overflow-hidden"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare size={20} className="fill-current" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
