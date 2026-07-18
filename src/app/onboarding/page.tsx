import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Film } from "lucide-react";
import { getCurrentUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export const metadata: Metadata = {
  title: "Thiết lập ban đầu — PhimFlow",
};

export default async function OnboardingPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  // Onboarding chỉ hiện MỘT LẦN: đã có UserPreference -> bỏ qua vào thẳng dashboard.
  const existing = await db.userPreference.findUnique({ where: { userId } });
  if (existing) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Background ambient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 30%, oklch(0.72 0.32 330 / 0.2) 0%, transparent 70%)",
        }}
      />

      <div className="z-10 mb-6 flex items-center gap-2">
        <Film
          size={26}
          className="text-primary"
          style={{
            filter: "drop-shadow(0 0 8px oklch(0.72 0.32 330 / 0.7))",
          }}
        />
        <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-xl font-black tracking-tight text-transparent">
          PHIMFLOW
        </span>
      </div>

      <main className="z-10 w-full max-w-lg">
        <div className="relative">
          <div className="absolute -inset-4 cyber-panel-strong rounded-2xl" />
          <div
            className="absolute -left-3 -top-3 z-10 h-6 w-6 border-l-2 border-t-2 border-primary"
            style={{ filter: "drop-shadow(0 0 4px oklch(0.72 0.32 330 / 0.7))" }}
          />
          <div
            className="absolute -right-3 -top-3 z-10 h-6 w-6 border-r-2 border-t-2 border-secondary"
            style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.18 200 / 0.7))" }}
          />
          <div
            className="absolute -bottom-3 -left-3 z-10 h-6 w-6 border-b-2 border-l-2 border-secondary"
            style={{ filter: "drop-shadow(0 0 4px oklch(0.85 0.18 200 / 0.7))" }}
          />
          <div
            className="absolute -bottom-3 -right-3 z-10 h-6 w-6 border-b-2 border-r-2 border-primary"
            style={{ filter: "drop-shadow(0 0 4px oklch(0.72 0.32 330 / 0.7))" }}
          />

          <div className="relative z-10 rounded-xl bg-bg/80 p-8 backdrop-blur-md">
            <div className="mb-6 text-center">
              <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <span className="inline-block h-1 w-1 rounded-full bg-primary pulse-glow" />
                SETUP.WIZARD
              </span>
              <h1 className="text-xl font-black tracking-tight holo-text">Chào mừng bạn!</h1>
              <p className="mt-1 text-xs text-text-secondary">
                Cho chúng tôi biết gu xem phim để gợi ý chính xác hơn. Bạn có thể đổi lại sau trong
                Cài đặt.
              </p>
            </div>
            <OnboardingForm />
          </div>
        </div>
      </main>
    </div>
  );
}
