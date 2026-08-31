# Plan: Watermark & AI Provenance Cleaner Web App (Vercel-Ready)

## Overview
Xây dựng ứng dụng Next.js 14+ / React hiện đại hỗ trợ làm sạch Watermark, AI provenance metadata trên Ảnh và Ký tự ẩn AI trên Content (Văn bản/HTML/Markdown), tối ưu triển khai 100% trên Vercel.

---

## Giai đoạn 1: Dọn dẹp Workspace
- Xóa các thư mục backend Python & benchmarks cũ: `service/`, `benchmarks/`, `integrations/`, `hooks/`, `skills/`, `tests/`, `docs/`.
- Xóa các file cấu hình thừa: `compose.yaml`, `install_skill.py`, `requirements-dev.txt`, `pytest.ini`, `ruff.toml`, `.coderabbit.yaml`, `.claude-plugin/`.
- Giữ lại `.agents/` và `LICENSE`.

---

## Giai đoạn 2: Khởi tạo Project Next.js & UI Core
- Khởi tạo `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.mjs`.
- Cài đặt các thư viện:
  - UI & Icons: `lucide-react`, `clsx`, `tailwind-merge`
  - Ảnh & Crop: `react-easy-crop` / Canvas 2D API
  - Content & Markdown: `marked`, `turndown`, `dompurify`
- Thiết lập theme Dark Mode công nghệ cao, giao diện kính mờ Glassmorphism.

---

## Giai đoạn 3: Xây dựng Module Xử lý
- `src/lib/unicodeSanitizer.ts`: Bảng tra cứu và giải thuật bóc ký tự ẩn Layer A (Zero-width characters, homoglyphs, bidi controls, variation selectors).
- `src/lib/imageEngine.ts`: Xử lý Canvas 2D, Crop theo tỉ lệ, Resize & Khóa aspect ratio, Bóc 100% C2PA / EXIF, Nén xuất ra AVIF, WebP, PNG, JPG.
- `src/lib/formatConverter.ts`: Bộ chuyển đổi đa chiều HTML ⇄ Markdown ⇄ Text.

---

## Giai đoạn 4: Xây dựng Giao diện người dùng (2 Tabs)
- **Tab 1: Image Studio (`src/components/ImageStudio/`)**:
  - Drag & Drop zone + Lắng nghe Paste clipboard (`Ctrl/Cmd + V`).
  - Interactive Cropper modal (Free, 1:1, 16:9, 9:16, 4:3, 3:2).
  - Thanh chỉnh Resize & Scale presets.
  - Chọn định dạng xuất (AVIF, WebP, PNG, JPG) và Quality slider.
  - So sánh trực quan Before / After & nút tải về.
- **Tab 2: Content Studio (`src/components/ContentStudio/`)**:
  - Khung nhập liệu đa năng (Text / HTML / Markdown).
  - Trình Visualizer trực quan đếm và highlight chính xác vị trí ký tự AI ẩn.
  - Chuyển đổi định dạng HTML ⇄ Markdown ⇄ Text 1-click.
  - Nút bấm Làm sạch (Sanitize), chuẩn hóa Unicode và Copy nhanh.

---

## Giai đoạn 5: Kiểm thử & Tối ưu Vercel
- Kiểm tra tính năng Paste, Crop, Resize, Nén ảnh trên trình duyệt.
- Kiểm tra làm sạch ký tự ẩn và chuyển đổi Markdown/HTML.
- Chạy `npm run build` để xác thực zero build errors.
