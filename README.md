# Watermark & AI Provenance Purifier

Ứng dụng web hiện đại xử lý ảnh, cắt/resize, nén đa định dạng và phát hiện, làm sạch ký tự ẩn AI (C2PA, EXIF, Zero-Width Characters, Homoglyphs) 100% Client-Side tối ưu triển khai trên **Vercel**.

---

## ✨ Tính Năng Nổi Bật

### 🖼️ Tab 1: Studio Xử lý & Nén Ảnh
- **Nạp ảnh linh hoạt**: Chọn tệp từ máy, kéo thả trực tiếp hoặc bấm `Ctrl + V` / `Cmd + V` để paste ảnh chụp màn hình từ clipboard.
- **Cắt ảnh (Crop Presets)**: Hỗ trợ các tỉ lệ chuẩn: `Tự do`, `1:1` (Avatar/Vuông), `16:9` (YouTube/Cover), `9:16` (Story/TikTok/Reels), `4:3`, `3:2`.
- **Resize & Tỷ lệ khung hình**: Tùy chỉnh chiều rộng/cao, bật/tắt khóa tỷ lệ (Aspect Ratio Lock), nút scale nhanh (25%, 50%, 75%, 100%, 200%).
- **Xóa 100% Metadata & Watermark AI**: Tự động triệt tiêu vĩnh viễn mọi khối `C2PA`, `EXIF`, `XMP`, `JUMB` qua Canvas raw pixel engine.
- **Pixel Jitter**: Tùy chọn phân tán vi nhiễu vô hình để vô hiệu hóa chữ ký điểm ảnh sinh bởi AI steganography.
- **Nén & Xuất đa định dạng**: Chuyển đổi sang **AVIF**, **WebP**, **PNG**, **JPG** kèm thanh trượt điều chỉnh chất lượng và tính toán % dung lượng tiết kiệm.
- **So sánh trực quan Before / After**: Thanh trượt so sánh ảnh gốc và ảnh đã làm sạch.

---

### 📝 Tab 2: Studio Làm sạch & Chuyển đổi Content
- **Hỗ trợ đa định dạng**: Văn bản thô (Plain Text), Markdown (`.md`), và HTML (`.html`).
- **Phát hiện ký tự ẩn AI (Live Visualizer)**:
  - Zero-width spaces (`U+200B..200D`, `U+FEFF`, `U+2060`, `U+00AD`).
  - Variation selectors (`U+FE00..FE0F`), Bidi controls (`U+202E`, `U+202A..`).
  - Homoglyphs Cyrillic giả dạng ký tự Latinh tiếng Anh.
  - Hiển thị badge trực quan vị trí và mã hex từng ký tự ẩn.
- **Bộ chuyển đổi định dạng 2 chiều**:
  - `HTML ➔ Markdown`
  - `Markdown ➔ HTML`
  - `HTML / Markdown ➔ Plain Text`
- **1-Click Làm sạch (Sanitize)**: Xóa ký tự ẩn, chuẩn hóa khoảng trắng lạ, chuẩn hóa Unicode NFKC.
- **Sao chép & Tải về**: Nút Copy 1-click kèm trạng thái và download file (`.md`, `.html`, `.txt`).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Cài đặt dependencies:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev Server):
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

### 3. Build sản phẩm (Production Build):
```bash
npm run build
```

---

## 🌐 Triển Khai Lên Vercel (1-Click Deploy)
Ứng dụng hoạt động 100% trên trình duyệt (Client-Side), không cần cấu hình server hay biến môi trường:
1. Đẩy mã nguồn lên kho lưu trữ GitHub / GitLab.
2. Import project vào [Vercel](https://vercel.com).
3. Nhấn **Deploy** (Vercel tự động nhận diện cấu hình Next.js).
