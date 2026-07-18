import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, afterAll, beforeAll } from "vitest";
import { server } from "./src/test/msw/server";

// Bật MSW cho toàn bộ test. Request không có handler sẽ được bỏ qua (bypass)
// để các test thuần logic/UI không bị ảnh hưởng; test integration có thể siết bằng server.use().
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
