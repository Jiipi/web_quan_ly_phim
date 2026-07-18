import React from "react";
import Link from "next/link";
import { Film } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="relative border-t border-primary/20 bg-bg/40 backdrop-blur-md">
      {/* Top neon line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-secondary"
        style={{ boxShadow: "0 0 12px oklch(0.72 0.32 330 / 0.7)" }}
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Logo & description */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Link href="/" className="flex items-center gap-2 group">
              <Film
                size={20}
                className="text-primary transition-all group-hover:rotate-12"
                style={{
                  filter: "drop-shadow(0 0 6px oklch(0.72 0.32 330 / 0.7))",
                }}
              />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-base font-black tracking-tight text-transparent">
                PHIMFLOW
              </span>
            </Link>
            <p className="max-w-xs text-center text-xs leading-relaxed text-text-muted md:text-left">
              Hệ điều hành xem phim cá nhân — track tiến độ, AI tóm tắt không spoil, phân tích gu
              xem phim.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8 font-mono text-xs uppercase tracking-widest">
            <div className="flex flex-col gap-2.5">
              <h4 className="font-bold text-text-muted">Products</h4>
              <Link
                href="#features"
                className="text-text-secondary transition-all hover:text-primary hover:[text-shadow:0_0_6px_oklch(0.72_0.32_330_/_0.7)]"
              >
                {"// Features"}
              </Link>
              <Link
                href="#how-it-works"
                className="text-text-secondary transition-all hover:text-secondary hover:[text-shadow:0_0_6px_oklch(0.85_0.18_200_/_0.7)]"
              >
                {"// Workflow"}
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <h4 className="font-bold text-text-muted">Account</h4>
              <Link
                href="/login"
                className="text-text-secondary transition-all hover:text-accent hover:[text-shadow:0_0_6px_oklch(0.7_0.32_290_/_0.7)]"
              >
                {"// Login"}
              </Link>
              <Link
                href="/register"
                className="text-text-secondary transition-all hover:text-primary hover:[text-shadow:0_0_6px_oklch(0.72_0.32_330_/_0.7)]"
              >
                {"// Register"}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-primary/10 pt-6 font-mono text-[10px] uppercase tracking-widest text-text-muted md:flex-row md:justify-between">
          <span>© 2026 PHIMFLOW // All_Systems_Operational</span>
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-primary">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-secondary">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
