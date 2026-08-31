# Design Specification: Watermark Purifier (Be Vietnam Pro - Minimalist Clean Theme)

## 0. Design Read
> **Reading this as:** Ultra-sleek, minimalist utility tool for Vietnamese content creators & developers with **Be Vietnam Pro** typography. Zero marketing noise, high functional clarity, compact controls, and crisp shadcn-style surfaces.

---

## 1. Dials
- `DESIGN_VARIANCE: 4` (Structured, clean, focused utility interface)
- `MOTION_INTENSITY: 3` (Fast, subtle transitions, tactile active states)
- `VISUAL_DENSITY: 6` (High productivity, compact toolbars, zero fluff)

---

## 2. Typography
- **Primary Sans**: `Be Vietnam Pro`, system-ui, -apple-system, sans-serif
- **Font Mono**: `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, monospace
- **Hierarchy**:
  - App Title: `font-bold text-base sm:text-lg tracking-tight`
  - Section Headers: `font-semibold text-xs sm:text-sm text-zinc-900`
  - UI Labels & Buttons: `font-medium text-xs`
  - Body / Data: `text-xs text-zinc-600`

---

## 3. Color Tokens (Shadcn Light Clean)
- **Background**: `#fafafa` (zinc-50) / `#ffffff` (white)
- **Surface / Card**: `#ffffff` with border `#e4e4e7` (zinc-200)
- **Primary Text**: `#09090b` (zinc-950)
- **Muted Text**: `#71717a` (zinc-500)
- **Border**: `#e4e4e7` (zinc-200) / `#f4f4f5` (zinc-100)
- **Primary Button**: `#18181b` (zinc-900) text `#ffffff`
- **Warning Badge**: `#ef4444` (rose-500) / `#fef2f2` (rose-50)
- **Success Badge**: `#10b981` (emerald-500) / `#f0fdf4` (emerald-50)

---

## 4. Decluttering & Layout Rules
- No bulky marketing banners or feature bullet explanations.
- Toolbars are consolidated into single horizontal bars.
- Modals handle complex actions (Crop, Resize) to keep main canvas lightweight.
- Text editors maximize productive vertical viewport space.
