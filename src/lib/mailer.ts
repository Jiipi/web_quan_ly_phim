import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";

/**
 * SMTP Gmail transporter cho form "Báo lỗi".
 *
 * - Dùng App Password (KHÔNG phải mật khẩu Gmail thường). Xem .env.example.
 * - Nếu thiếu GMAIL_USER hoặc GMAIL_APP_PASSWORD, `getMailer()` trả về null;
 *   route handler sẽ fallback: vẫn lưu DB nhưng KHÔNG gửi mail (tránh chặn UX).
 * - Transporter được cache trong module scope — nodemailer connection pool tự quản lý.
 */

let cached: Transporter | null = null;

export interface BugReportEmail {
  category: string;
  subject: string;
  description: string;
  userEmail: string;
  userName: string;
  attachmentPaths?: string[];
}

export interface MailerSendResult {
  ok: boolean;
  error?: string;
}

function getMailer(): Transporter | null {
  if (cached) return cached;
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) return null;

  cached = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""), // Google App Password có thể chứa dấu cách
    },
  });
  return cached;
}

/** Địa chỉ nhận báo lỗi. Mặc định: GMAIL_USER nếu không đặt GMAIL_REPORT_TO. */
export function getReportTo(): string {
  return env.GMAIL_REPORT_TO ?? env.GMAIL_USER ?? "";
}

/** Gửi mail báo lỗi. Trả về ok=false nếu thiếu cấu hình — caller xử lý fallback. */
export async function sendBugReportEmail(payload: BugReportEmail): Promise<MailerSendResult> {
  const mailer = getMailer();
  const to = getReportTo();
  if (!mailer || !to) {
    return {
      ok: false,
      error: "Mailer chưa được cấu hình (thiếu GMAIL_USER / GMAIL_APP_PASSWORD).",
    };
  }

  const fromName = "CineOS Bug Reporter";
  const from = env.GMAIL_USER as string;
  const subject = `[Bug][${payload.category}] ${payload.subject}`;

  const html = renderBugReportHtml(payload);
  const text = renderBugReportText(payload);

  try {
    await mailer.sendMail({
      from: `"${fromName}" <${from}>`,
      to,
      replyTo: payload.userEmail || undefined,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mailer] sendBugReportEmail failed:", message);
    return { ok: false, error: message };
  }
}

function renderBugReportHtml(p: BugReportEmail): string {
  const safe = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:16px;color:#0f172a">
      <h2 style="margin:0 0 12px;font-size:18px">🐛 Báo lỗi mới — CineOS</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600;width:120px">Loại</td>
            <td style="padding:6px 12px">${safe(p.category)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Tiêu đề</td>
            <td style="padding:6px 12px">${safe(p.subject)}</td></tr>
        <tr><td style="padding:6px 12px;background:#f8fafc;font-weight:600">Người gửi</td>
            <td style="padding:6px 12px">${safe(p.userName)} &lt;${safe(p.userEmail)}&gt;</td></tr>
      </table>
      <h3 style="margin:16px 0 6px;font-size:14px">Mô tả chi tiết</h3>
      <div style="padding:12px;background:#f8fafc;border-radius:8px;font-size:14px;line-height:1.5">
        ${safe(p.description)}
      </div>
      ${
        p.attachmentPaths && p.attachmentPaths.length > 0
          ? `<h3 style="margin:16px 0 6px;font-size:14px">File đính kèm (lưu trên server)</h3>
             <ul style="font-size:13px;color:#475569">${p.attachmentPaths
               .map((u) => `<li>${safe(u)}</li>`)
               .join("")}</ul>`
          : ""
      }
      <p style="margin-top:24px;font-size:11px;color:#94a3b8">
        Gửi tự động từ CineOS • ${new Date().toISOString()}
      </p>
    </div>
  `;
}

function renderBugReportText(p: BugReportEmail): string {
  return [
    `[Bug Report — CineOS]`,
    `Loại:    ${p.category}`,
    `Tiêu đề: ${p.subject}`,
    `Người gửi: ${p.userName} <${p.userEmail}>`,
    ``,
    `--- Mô tả ---`,
    p.description,
    ``,
    p.attachmentPaths && p.attachmentPaths.length > 0
      ? `--- File đính kèm ---\n${p.attachmentPaths.join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
