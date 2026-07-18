"use client";

// global-error thay thế cả root layout khi crash -> phải tự khai báo html/body + style nội tuyến.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          background: "#0B0E17",
          color: "#F5F5F5",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <title>Lỗi hệ thống — CineOS</title>
        <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Lỗi hệ thống</h1>
        <p style={{ fontSize: "14px", color: "#94A3B8", maxWidth: "28rem", lineHeight: 1.6 }}>
          Ứng dụng gặp sự cố nghiêm trọng. Vui lòng tải lại trang.
        </p>
        <button
          onClick={() => reset()}
          style={{
            background: "#DC2626",
            color: "#fff",
            border: "none",
            borderRadius: "9999px",
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Tải lại
        </button>
      </body>
    </html>
  );
}
