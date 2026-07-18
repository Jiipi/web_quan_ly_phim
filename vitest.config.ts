import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcAlias = path.resolve(__dirname, "src");

// Dùng resolve.alias trực tiếp thay vì vite-tsconfig-paths vì plugin
// thi thoảng không resolve được alias `@/*` cho file TSX/TS trong một số
// phiên bản Vite/Vite-tsconfig-paths (xem bug ở 5 test fail). Alias này
// vẫn khớp với tsconfig.json -> typecheck/build không đổi.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": srcAlias,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules", ".next", "e2e", "**/*.config.*", "**/*.d.ts", "prisma"],
    },
  },
});
