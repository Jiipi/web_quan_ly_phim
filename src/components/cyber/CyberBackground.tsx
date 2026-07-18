"use client";

/**
 * CyberBackground — fixed full-viewport ambient layer that gives the entire app
 * a neon cyberpunk/synthwave atmosphere:
 *   - animated grid scrolling diagonally
 *   - radial neon light pools (pink / violet / cyan)
 *   - subtle scanline texture (CRT vibe)
 *   - drifting particles
 *   - vignette edge darkening
 *
 * Mounted once at root layout. SSR-safe (no animations on the server render).
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface CyberBackgroundProps {
  className?: string;
  /** Reduce intensity (used on inner authenticated pages). */
  subtle?: boolean;
}

const GRID_LINES = 18;
const PARTICLES_LIGHT = 8;
const PARTICLES_HEAVY = 14;

interface ParticleSpec {
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: "pink" | "cyan" | "violet";
}

function genParticles(count: number, seed: number): ParticleSpec[] {
  // Deterministic pseudo random to avoid SSR/hydration mismatch
  const rng = (n: number) => {
    const x = Math.sin(seed + n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  const colors: ParticleSpec["color"][] = ["pink", "cyan", "violet"];
  return Array.from({ length: count }, (_, i) => ({
    left: Math.round(rng(i + 1) * 10000) / 100,
    size: Math.round((2 + rng(i + 100) * 4) * 100) / 100,
    duration: Math.round((14 + rng(i + 50) * 16) * 100) / 100,
    delay: Math.round(rng(i + 200) * 20 * 100) / 100,
    opacity: Math.round((0.3 + rng(i + 300) * 0.4) * 1000) / 1000,
    color: colors[Math.floor(rng(i + 400) * 3)],
  }));
}

const PARTICLE_COLOR_VAR: Record<ParticleSpec["color"], string> = {
  pink: "oklch(0.72 0.32 330)",
  cyan: "oklch(0.85 0.18 200)",
  violet: "oklch(0.7 0.32 290)",
};

export function CyberBackground({
  className,
  subtle = false,
}: CyberBackgroundProps) {
  const particles = React.useMemo(
    () => genParticles(PARTICLES_LIGHT, subtle ? 99 : 7),
    [subtle],
  );
  const bigParticles = React.useMemo(
    () => genParticles(PARTICLES_HEAVY, subtle ? 314 : 21),
    [subtle],
  );

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* Base solid backdrop – ensures full coverage */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% -10%, oklch(0.2 0.06 290) 0%, oklch(0.13 0.04 290) 60%)",
        }}
      />

      {/* Animated grid */}
      {!subtle && (
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.85 0.18 200 / 0.7) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.18 200 / 0.7) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 75% 60% at 50% 35%, black 0%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 60% at 50% 35%, black 0%, transparent 90%)",
          }}
        />
      )}

      {/* Scrolling grid layer */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `linear-gradient(oklch(0.72 0.32 330 / 0.6) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.32 330 / 0.6) 1px, transparent 1px)`,
          backgroundSize: "112px 112px",
          animation: "cyberGridScroll 14s linear infinite",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 25%, black 80%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 25%, black 80%, transparent 100%)",
        }}
      />

      {/* Neon orbs */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 h-[560px] w-[860px] rounded-full blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.72 0.32 330 / 0.55), transparent 65%)",
        }}
      />
      <div
        className="absolute top-1/3 -left-32 h-[420px] w-[520px] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.7 0.32 290 / 0.55), transparent 65%)",
        }}
      />
      <div
        className="absolute top-2/3 -right-32 h-[460px] w-[540px] rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.85 0.18 200 / 0.45), transparent 65%)",
        }}
      />
      {subtle && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.72 0.32 330 / 0.45), transparent 65%)",
          }}
        />
      )}

      {/* Horizon synthwave glow line */}
      <div
        className="absolute left-0 right-0 mx-auto h-px w-3/4 max-w-3xl"
        style={{
          top: "62%",
          background:
            "linear-gradient(90deg, transparent 0%, oklch(0.85 0.18 200 / 0.7) 30%, oklch(0.72 0.32 330 / 0.7) 50%, oklch(0.85 0.18 200 / 0.7) 70%, transparent 100%)",
          boxShadow:
            "0 0 18px oklch(0.72 0.32 330 / 0.5), 0 0 36px oklch(0.85 0.18 200 / 0.3)",
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.5] mix-blend-overlay"
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 2px, rgba(255,255,255,0.02) 3px, transparent 4px)",
        }}
      />

      {/* Particles */}
      <div className="absolute inset-0">
        {particles.map((p, i) => (
          <span
            key={`p-${i}`}
            className="particle"
            style={{
              left: `${p.left}%`,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: PARTICLE_COLOR_VAR[p.color],
              boxShadow: `0 0 ${p.size * 2}px ${PARTICLE_COLOR_VAR[p.color]}`,
              opacity: p.opacity,
              animationName: "floatParticle",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
        {!subtle &&
          bigParticles.map((p, i) => (
            <span
              key={`q-${i}`}
              className="particle"
              style={{
                left: `${p.left}%`,
                bottom: "-10px",
                width: `${p.size + 4}px`,
                height: `${p.size + 4}px`,
                background: PARTICLE_COLOR_VAR[p.color],
                boxShadow: `0 0 ${(p.size + 4) * 2}px ${PARTICLE_COLOR_VAR[p.color]}`,
                opacity: p.opacity * 0.6,
                animationName: "floatParticle",
                animationDuration: `${p.duration * 1.5}s`,
                animationDelay: `${p.delay + 5}s`,
              }}
            />
          ))}
      </div>

      {/* Vignette (edge darkening) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Subtle horizontal noise/film grain via inline gradient */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(transparent 50%, rgba(255,255,255,0.6) 50%)",
          backgroundSize: "2px 2px",
        }}
      />

      {/* Decorative corner HUD brackets (top-left & bottom-right) */}
      <div
        className="absolute left-6 top-24 h-8 w-8 border-l-2 border-t-2 border-primary opacity-50"
        style={{
          filter:
            "drop-shadow(0 0 6px oklch(0.72 0.32 330 / 0.6))",
        }}
      />
      <div
        className="absolute right-6 bottom-24 h-8 w-8 border-b-2 border-r-2 border-secondary opacity-50"
        style={{
          filter:
            "drop-shadow(0 0 6px oklch(0.85 0.18 200 / 0.6))",
        }}
      />

      {/* Decorative grid lines count */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-text-muted"
        style={{ opacity: 0.5 }}
      >
        {Array.from({ length: GRID_LINES }).map((_, i) => (
          <span key={i} className="mx-1">
            {String(i + 1).padStart(2, "0")}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A lightweight header-only background just for inner pages (no particles / horizon). */
export function CyberSubtleBackground() {
  return <CyberBackground subtle />;
}
