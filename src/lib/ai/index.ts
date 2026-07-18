import { env } from "@/lib/env";
import { mockProvider } from "./mock";
import type { AIProvider } from "./types";

export * from "./types";

/**
 * Chọn provider AI theo cấu hình env.
 * - AI_PROVIDER=openai + có OPENAI_API_KEY -> OpenAI thật.
 * - Ngược lại (mock, hoặc thiếu key, hoặc google chưa hỗ trợ) -> mock (luôn chạy được).
 */
export function getAIProvider(): AIProvider {
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) {
    // Import động để không nạp AI SDK khi dùng mock.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { openaiProvider } = require("./openai") as typeof import("./openai");
    return openaiProvider;
  }
  return mockProvider;
}
