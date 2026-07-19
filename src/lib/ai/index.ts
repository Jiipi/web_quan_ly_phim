import { env } from "@/lib/env";
import { mockProvider } from "./mock";
import type { AIProvider } from "./types";

export * from "./types";

/**
 * Chọn provider AI theo cấu hình env.
 * - AI_PROVIDER=openai + có OPENAI_API_KEY -> OpenAI thật (GPT-4o-mini, trả phí).
 * - AI_PROVIDER=groq + có GROQ_API_KEY -> Groq thật (Llama 3.3 70B, free tier).
 * - AI_PROVIDER=google + có GOOGLE_GENERATIVE_AI_API_KEY -> (chưa hỗ trợ) -> mock.
 * - Ngược lại -> mock (luôn chạy được).
 */
export function getAIProvider(): AIProvider {
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    // Import động để không nạp AI SDK khi dùng mock.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { openaiProvider } = require("./openai") as typeof import("./openai");
    return openaiProvider;
  }
  if (env.AI_PROVIDER === "groq" && env.GROQ_API_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { groqProvider } = require("./groq") as typeof import("./groq");
    return groqProvider;
  }
  return mockProvider;
}
