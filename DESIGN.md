# Design Specification: Watermark Purifier (WordPress Ready & Pro WYSIWYG)

## 0. Design Read
> **Reading this as:** High-end, executive-grade content & media publishing suite with dual Visual WYSIWYG / Source Code workflow tailored for WordPress authors, SEO editors, and digital creators. Pristine **Be Vietnam Pro** typography, rich formatted preview (H1-H6, bold, lists, quotes, tables), multi-MIME clipboard writing (`text/html` + `text/plain`), and sleek shadcn-inspired surfaces.

---

## 1. Dials
- `DESIGN_VARIANCE: 5` (Structured, elegant, highly usable publishing studio)
- `MOTION_INTENSITY: 4` (Smooth transitions, tactile buttons, soft micro-interactions)
- `VISUAL_DENSITY: 5` (Balanced workspace, spacious visual preview, crisp toolbars)

---

## 2. Typography & Tokens
- **Font Sans**: `Be Vietnam Pro`, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Font Mono**: `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, monospace
- **Hierarchy & Article Formatting**:
  - H1: `text-2xl font-bold text-zinc-950 mt-4 mb-2 tracking-tight`
  - H2: `text-xl font-bold text-zinc-900 mt-3 mb-2 tracking-tight`
  - H3: `text-lg font-semibold text-zinc-900 mt-2 mb-1`
  - Paragraphs: `text-sm text-zinc-700 leading-relaxed my-2`
  - Bold / Strong: `font-bold text-zinc-950`
  - Blockquotes: `border-l-4 border-zinc-300 pl-3 italic text-zinc-600 my-2`
  - Code / Pre: `bg-zinc-100 px-1 py-0.5 rounded text-xs font-mono text-zinc-800`

---

## 3. Surface & Color System
- **App Root Background**: `#f8fafc` (slate-50) / `#fafafa` (zinc-50)
- **Editor Workspace**: `#ffffff` with crisp `border-zinc-200` and `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`
- **Active Navigation Pill**: `#18181b` (zinc-900) text `#ffffff` with subtle inner glow
- **Clipboard Action**: Multi-MIME Smart Copy button (`text/html` + `text/plain`) with emerald success feedback.

---

## 4. WordPress Multi-MIME Clipboard Engine
- **Copy Mechanism**: Writes both rich `text/html` and raw `text/plain` simultaneously using `navigator.clipboard.write([new ClipboardItem(...)])`.
  - Pasting into WordPress **Tab Visual (Gutenberg / TinyMCE)** reads `text/html` (keeps all headings, bold, links, lists).
  - Pasting into WordPress **Tab Code (HTML source)** reads `text/plain` (pastes clean HTML markup).
