# Plan: Humanize AI Typography & Fix Extended Characters (Option B & C)

## 📌 Context
Giải quyết triệt để vấn đề các ký tự typography đặc trưng của AI (dấu gạch ngang dài En-dash `–`, Em-dash `—`, dấu ngoặc kép cong `“”`, dấu ba chấm `…`, ký tự dãn pixel Fullwidth `ＡＢＣ`) để đưa văn bản về đúng chuẩn gõ phím thông thường của con người.

---

## 🛠️ Chi Tiết Triển Khai

### Giai đoạn 1: Nâng cấp Core Engine (`src/lib/unicodeSanitizer.ts`)
- Định nghĩa các bảng Unicode Homoglyphs:
  - `DASH_HOMOGLYPHS`: En-dash (`U+2013`), Em-dash (`U+2014`), Minus (`U+2212`), Horizontal bar (`U+2015`), Non-breaking hyphen (`U+2011`) ➔ `-` (`U+002D`).
  - `QUOTE_HOMOGLYPHS`: `“”, „, ‟` ➔ `"` | `‘’, ‚, ‛` ➔ `'`.
  - `ELLIPSIS_CODEPOINT`: `…` (`U+2026`) ➔ `...`.
  - `FULLWIDTH_ASCII_MAP`: Ký tự toàn chiều rộng `U+FF01..U+FF5E` ➔ ASCII thường.
- Cập nhật hàm `inspectText`, `segmentTextWithFindings`, và `cleanText`.

### Giai đoạn 2: Nâng cấp UI ContentStudio (`src/components/ContentStudio/ContentStudio.tsx`)
- **In-Text Visualizer**:
  - Gắn badge màu phân loại trực quan: `[DASH: –]`, `[DASH: —]`, `[QUOTE: “]`, `[ELLIPSIS: …]`, `[FULLWIDTH: Ａ]`.
  - Hiển thị popover chi tiết mã hex và ký tự thay thế khi bấm vào badge.
- **Tùy chọn lọc (Option B)**:
  - Checkbox: `Chuẩn hóa dấu gạch ngang (–, — ➔ -)`
  - Checkbox: `Chuẩn hóa dấu ngoặc cong (“ ” ➔ " ")`
  - Checkbox: `Chuẩn hóa dấu ba chấm (… ➔ ...)`
  - Checkbox: `Thu hẹp ký tự dãn pixel (Fullwidth ➔ ASCII)`
- **Mẫu thử nhanh**: Cập nhật nút chèn văn bản mẫu chứa đầy đủ các loại ký tự AI typography để kiểm tra tức thì.

### Giai đoạn 3: Kiểm thử & Đẩy Code Lên GitHub
- Kiểm tra kết quả chuyển đổi trên giao diện.
- Chạy `npm run build` xác thực zero errors.
- Commit & push lên nhánh `main` GitHub.
