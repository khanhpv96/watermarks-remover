# Design Specification: Watermark Purifier (Pro SaaS Utility - Be Vietnam Pro)

## 0. Design Read
> **Reading this as:** Top-tier developer & content creator tool (Linear/Vercel caliber) with **Be Vietnam Pro** typography. Crisp borders (`border-zinc-200/80`), subtle micro-elevations (`shadow-xs`), refined neutral palettes (Zinc/Slate), sleek icon favicon, and purposeful semantic accents (Emerald-600, Amber-500, Rose-500, Sky-600).

---

## 1. Dials
- `DESIGN_VARIANCE: 4` (Clean, structured, highly professional layout)
- `MOTION_INTENSITY: 3` (Fast, subtle transitions, tactile active states)
- `VISUAL_DENSITY: 6` (High utility, compact toolbars, zero fluff)

---

## 2. Typography & Tokens
- **Font Sans**: `Be Vietnam Pro`, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Font Mono**: `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, monospace
- **Hierarchy**:
  - Logo: `text-sm font-bold tracking-tight text-zinc-950`
  - Section Headings: `text-xs font-semibold uppercase tracking-wider text-zinc-600`
  - Inputs & Buttons: `text-xs font-medium`
  - Data & Metrics: `font-mono text-xs`

---

## 3. Surface & Color System
- **App Background**: `#fafafa` (zinc-50)
- **Cards & Surfaces**: `#ffffff` (white) with `border-zinc-200/80` and `shadow-[0_1px_3px_rgba(0,0,0,0.04)]`
- **Primary CTA**: `#18181b` (zinc-900) hover `#27272a` (zinc-800) text `#ffffff`
- **Success Action (Download/Safe)**: `#16a34a` (emerald-600) hover `#15803d` (emerald-700)
- **Badges**:
  - Zero-width & Hidden: `bg-rose-50 text-rose-700 border-rose-200`
  - Dashes & Hyphens: `bg-amber-50 text-amber-700 border-amber-200`
  - Quotes: `bg-sky-50 text-sky-700 border-sky-200`
  - Ellipsis: `bg-indigo-50 text-indigo-700 border-indigo-200`
  - Fullwidth: `bg-teal-50 text-teal-700 border-teal-200`

---

## 4. Brand & Favicon
- **Icon**: Shield with central clean Sparkles / Purifier glyph in monochrome zinc-900 / emerald-500 accent.
