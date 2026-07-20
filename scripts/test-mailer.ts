 
/**
 * Test gửi mail thật qua mailer.ts. Chạy một lần để verify SMTP Gmail hoạt động.
 *
 *   node --env-file=.env --import tsx scripts/test-mailer.ts
 *
 * Hoặc (Windows-friendly):
 *   npx tsx --env-file=.env scripts/test-mailer.ts
 *
 * Sau khi test xong, XÓA file này (không commit).
 */
import { sendBugReportEmail, getReportTo } from "../src/lib/mailer";

async function main() {
  console.log("=".repeat(60));
  console.log("[test-mailer] Kiểm tra cấu hình");
  console.log("=".repeat(60));
  console.log("  GMAIL_USER      :", process.env.GMAIL_USER ? "✓ đã đặt" : "✗ THIẾU");
  console.log("  GMAIL_APP_PASS  :", process.env.GMAIL_APP_PASSWORD ? "✓ đã đặt" : "✗ THIẾU");
  console.log("  GMAIL_REPORT_TO :", getReportTo() || "(chưa đặt)");
  console.log("");

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("❌ Thiếu GMAIL_USER hoặc GMAIL_APP_PASSWORD. Kiểm tra file .env");
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("[test-mailer] Gửi mail test");
  console.log("=".repeat(60));

  const result = await sendBugReportEmail({
    category: "TEST",
    subject: "[Test] Mailer từ script test",
    description: `Đây là email test tự động được gửi từ scripts/test-mailer.ts.

Mục đích: xác nhận App Password Gmail hoạt động đúng.

Thời gian: ${new Date().toISOString()}

Nếu bạn nhận được mail này → cấu hình SMTP đã sẵn sàng, form "Báo lỗi" trên /profile sẽ gửi được mail thật.`,
    userEmail: process.env.GMAIL_USER,
    userName: "Test Script",
    attachmentPaths: [],
  });

  if (result.ok) {
    console.log("");
    console.log("✅ GỬI THÀNH CÔNG!");
    console.log("   Kiểm tra inbox:", getReportTo());
    console.log("   (Đừng quên kiểm tra cả thư mục Spam/Promotions)");
  } else {
    console.error("");
    console.error("❌ GỬI THẤT BẠI:");
    console.error("   ", result.error);
    console.error("");
    console.error("Một số nguyên nhân thường gặp:");
    console.error("  1. App Password sai hoặc đã bị thu hồi");
    console.error("  2. Chưa bật 2-Step Verification trên Google Account");
    console.error("  3. Tài khoản Gmail bị khóa / yêu cầu xác minh");
    console.error("  4. Mạng/VPN chặn cổng 465/587");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Lỗi không mong đợi:", err);
  process.exit(1);
});
