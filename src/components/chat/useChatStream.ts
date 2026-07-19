import { useState, useCallback } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const loadSession = useCallback(async (sid: string) => {
    setError(null);
    setIsStreaming(false);
    try {
      const res = await fetch(`/api/ai/chat/history?sessionId=${sid}`);
      if (!res.ok) throw new Error("Không thể tải lịch sử chat");
      const data = (await res.json()) as { session: { id: string }; messages: Message[] };
      setSessionId(data.session.id);
      setMessages(data.messages);
    } catch (err: unknown) {
      console.error(err);
      setError("Không thể tải lịch sử trò chuyện.");
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(undefined);
    setError(null);
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setIsStreaming(true);
      setError(null);

      // 1. Add user message locally
      const userMsgId = crypto.randomUUID();
      const userMsg: Message = {
        id: userMsgId,
        role: "user",
        content: text,
      };

      // Set user message and empty bot message placeholder
      const assistantMsgId = crypto.randomUUID();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            message: text,
          }),
        });

        if (!response.ok) {
          const errData = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData.error || "Gặp lỗi khi gửi tin nhắn.");
        }

        // Get session ID from custom header
        const returnedSessionId = response.headers.get("X-Chat-Session-Id");
        if (returnedSessionId) {
          setSessionId(returnedSessionId);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("Không thể khởi động bộ đọc stream.");

        let botReply = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          botReply += chunk;

          // Update the last message content (assistant placeholder)
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: botReply } : m)),
          );
        }
      } catch (err: unknown) {
        console.error("Chat Stream Error:", err);
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
        // Remove empty assistant message if error occurred before any stream chunks
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, isStreaming],
  );

  return {
    messages,
    setMessages,
    isStreaming,
    error,
    sessionId,
    setSessionId,
    sendMessage,
    loadSession,
    clearChat,
  };
}
