---
name: design-system
description: UI/UX design system for DocuMind — color palette (dark/light mode), typography scale, spacing system, component patterns, glassmorphism effects, animation guidelines, icon system, responsive breakpoints, and page layout conventions.
---

# Design System Skill

## Design Philosophy

- **Dark mode first** — premium, modern feel for document management
- **Inbox-first, evidence-first** — surface actionable items immediately
- **Glassmorphism + subtle gradients** — depth without clutter
- **Micro-animations** — alive, responsive, professional
- **Information density** — show data efficiently, avoid wasting space

## Color System

### CSS Custom Properties (globals.css)

```css
:root {
  /* Primary palette */
  --color-primary: 222 84% 58%; /* #3B6CF4 Electric Blue */
  --color-primary-hover: 222 84% 52%;
  --color-primary-light: 222 84% 68%;
  --color-primary-dark: 222 84% 45%;

  /* Secondary palette */
  --color-secondary: 262 80% 60%; /* #7C4DFF Deep Purple */
  --color-secondary-hover: 262 80% 54%;

  /* Accent */
  --color-accent: 160 84% 44%; /* #12B886 Emerald */
  --color-accent-hover: 160 84% 38%;

  /* Semantic colors */
  --color-success: 142 71% 45%; /* #22C55E */
  --color-warning: 38 92% 50%; /* #F5A623 */
  --color-danger: 0 72% 56%; /* #E53E3E */
  --color-info: 199 89% 48%; /* #0EA5E9 */

  /* Dark mode backgrounds (default) */
  --color-bg: 222 47% 6%; /* #0A0E1A Deep Navy */
  --color-surface: 222 40% 10%; /* #111827 Surface */
  --color-card: 222 35% 13%; /* #1A2036 Card */
  --color-card-hover: 222 35% 16%;
  --color-border: 222 20% 20%; /* #2A3352 Subtle */
  --color-border-hover: 222 20% 28%;

  /* Text */
  --color-text: 0 0% 96%; /* #F5F5F5 Primary */
  --color-text-secondary: 220 15% 65%; /* #94A3B8 Secondary */
  --color-text-muted: 220 15% 45%; /* #64748B Muted */
  --color-text-inverse: 222 47% 11%; /* Dark text on light */

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, hsl(222 84% 58%), hsl(262 80% 60%));
  --gradient-accent: linear-gradient(135deg, hsl(160 84% 44%), hsl(199 89% 48%));
  --gradient-warm: linear-gradient(135deg, hsl(38 92% 50%), hsl(0 72% 56%));
  --gradient-surface: linear-gradient(180deg, hsl(222 40% 12%), hsl(222 40% 8%));

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.4);
  --shadow-glow-primary: 0 0 20px rgba(59, 108, 244, 0.3);
  --shadow-glow-accent: 0 0 20px rgba(18, 184, 134, 0.3);

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}

/* Light mode override */
[data-theme="light"] {
  --color-bg: 0 0% 98%;
  --color-surface: 0 0% 100%;
  --color-card: 0 0% 100%;
  --color-card-hover: 220 14% 96%;
  --color-border: 220 13% 91%;
  --color-border-hover: 220 13% 82%;
  --color-text: 222 47% 11%;
  --color-text-secondary: 220 8% 46%;
  --color-text-muted: 220 8% 65%;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

## Typography

```css
/* Font imports */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap");

:root {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Type scale */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */
  --text-5xl: 3rem; /* 48px */

  /* Font weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}

/* Usage conventions:
   - Headings: Inter, semibold/bold
   - Body text: Inter, normal/medium
   - Data/numbers: JetBrains Mono, medium
   - Buttons: Inter, semibold
   - Labels: Inter, medium, uppercase tracking-wide for small labels
*/
```

## Spacing System

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
}
```

## Component Patterns

### Glassmorphism Card

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-primary);
}
```

### Stats Card

```css
.stats-card {
  background: var(--gradient-surface);
  border: 1px solid hsl(var(--color-border));
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
}

.stats-card .stat-value {
  font-family: var(--font-mono);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Confidence Badge

```css
.badge-confidence {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.badge-confidence.high {
  background: hsl(var(--color-success) / 0.15);
  color: hsl(var(--color-success));
}
.badge-confidence.medium {
  background: hsl(var(--color-warning) / 0.15);
  color: hsl(var(--color-warning));
}
.badge-confidence.low {
  background: hsl(var(--color-danger) / 0.15);
  color: hsl(var(--color-danger));
}
```

## Animation Guidelines

```css
/* Timing */
:root {
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Hover lift */
.hover-lift {
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Fade in up (for page/card entrance) */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp var(--duration-slow) var(--ease-out) both;
}

/* Skeleton shimmer */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--color-card)) 25%,
    hsl(var(--color-card-hover)) 50%,
    hsl(var(--color-card)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

/* Stagger children animation */
.stagger-children > * {
  animation: fadeInUp var(--duration-slow) var(--ease-out) both;
}
.stagger-children > *:nth-child(1) {
  animation-delay: 0ms;
}
.stagger-children > *:nth-child(2) {
  animation-delay: 60ms;
}
.stagger-children > *:nth-child(3) {
  animation-delay: 120ms;
}
.stagger-children > *:nth-child(4) {
  animation-delay: 180ms;
}
.stagger-children > *:nth-child(5) {
  animation-delay: 240ms;
}

/* Pulse for active/processing state */
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 hsl(var(--color-primary) / 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px hsl(var(--color-primary) / 0);
  }
}
.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

## Layout Conventions

### App Shell

```
┌─────────────────────────────────────────────┐
│  Topbar (64px) — search, notifications, user│
├────────┬────────────────────────────────────┤
│        │                                    │
│ Sidebar│         Main Content               │
│ (260px)│         (flex-1, scrollable)        │
│        │                                    │
│ - Nav  │                                    │
│ - Tags │                                    │
│ - Quick│                                    │
│        │                                    │
└────────┴────────────────────────────────────┘
```

### Document Detail (Split View)

```
┌─────────────────────┬──────────────────────┐
│                     │  Metadata Panel      │
│  PDF/Image Preview  │  ┌──────────────┐    │
│  (60% width)        │  │ Thông tin chung│   │
│                     │  ├──────────────┤    │
│  - Zoom/Pan         │  │ Thanh toán    │   │
│  - Page navigation  │  ├──────────────┤    │
│  - Text select      │  │ Bảo hành     │    │
│                     │  ├──────────────┤    │
│                     │  │ Tags/Actions  │    │
│                     │  └──────────────┘    │
└─────────────────────┴──────────────────────┘
```

## Responsive Breakpoints

- **Mobile** (< 768px): Single column, bottom nav, stacked views
- **Tablet** (768-1024px): Collapsible sidebar, 2-column where possible
- **Desktop** (1024-1536px): Full sidebar, split views, 3-column grids
- **Wide** (> 1536px): Max-width container, expanded data tables

## Icon System

- Use **Lucide React** icons (consistent, open-source)
- Size conventions: 16px (inline), 20px (buttons), 24px (navigation), 32px (features)
- Always pair icons with text labels in navigation (accessibility)
