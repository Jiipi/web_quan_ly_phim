/**
 * Chạy MỘT LẦN khi Next.js server khởi động (trước khi nhận request).
 * Dùng để validate biến môi trường -> fail-fast với thông báo rõ ràng nếu cấu hình sai.
 * Xem: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md
 */
export async function register() {
  // Chỉ validate trên runtime Node.js (server chính); bỏ qua edge để tránh trùng lặp.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertEnv } = await import("@/lib/env");
    assertEnv();
  }
}
