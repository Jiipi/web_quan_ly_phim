/**
 * Design tokens — single source of truth for PhimFlow.
 * OKLCH color space for perceptually uniform P3 coverage.
 */

export const SPACING = {
  px: "1px",
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const RADIUS = {
  none: "0",
  sm: "6px",
  md: "10px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  full: "9999px",
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.75rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
    "5xl": ["3rem", { lineHeight: "1.15" }],
    "6xl": ["3.75rem", { lineHeight: "1.1" }],
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

export const MOTION = {
  duration: {
    instant: "100ms",
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
    slower: "600ms",
  },
  ease: {
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;

export const SHADOWS = {
  sm: "0 1px 2px rgba(0,0,0,0.3)",
  md: "0 4px 6px rgba(0,0,0,0.3)",
  lg: "0 10px 25px rgba(0,0,0,0.4)",
  xl: "0 20px 50px rgba(0,0,0,0.5)",
  glowPrimary: "0 0 24px oklch(0.65 0.21 18 / 0.35)",
  glowGold: "0 0 24px oklch(0.78 0.16 75 / 0.3)",
} as const;
