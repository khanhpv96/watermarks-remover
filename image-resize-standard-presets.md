# Task: Thêm Kích thước thông dụng vào tính năng Resize

> **Slug:** `image-resize-standard-presets`  
> **Status:** Pending Approval  
> **Assigned Agents:** `project-planner` (Plan) → `frontend-specialist` (Implementation) → `test-engineer` (Verification)

---

## 1. Yêu cầu & Bối cảnh
- **Vị trí:** `src/components/ImageStudio/ResizeModal.tsx`
- **Tiêu đề khối:** "Kích thước thông dụng"
- **Vị trí hiển thị:** Bên dưới khối "Scale nhanh theo tỷ lệ %"
- **Các mốc kích thước:** `2048 x auto`, `1200 x auto`, `1000 x auto`, `890 x auto`, `850 x auto`.
- **Nguyên tắc tính toán:**
  - Xác định cạnh dài nhất của ảnh gốc: `Math.max(baseWidth, baseHeight)`.
  - Nếu `baseWidth >= baseHeight`: Chiều rộng = giá trị chọn, Chiều cao = `Math.round(giá trị / aspect)`.
  - Nếu `baseHeight > baseWidth`: Chiều cao = giá trị chọn, Chiều rộng = `Math.round(giá trị * aspect)`.
  - Tự động bật `lockAspect = true` để giữ nguyên tỷ lệ và chống méo ảnh.

---

## 2. Phân rã công việc (Task Breakdown)
1. **Frontend Specialist (`frontend-specialist`):**
   - Viết hàm `handleApplyMaxDimension(targetMax: number)` trong [ResizeModal.tsx](file:///c:/Users/VINHTECH/Desktop/my-projects/watermarks-remover/src/components/ImageStudio/ResizeModal.tsx).
   - Thêm UI khối "Kích thước thông dụng" với grid buttons và hiển thị kích thước preview tinh gọn.
2. **Test Engineer (`test-engineer`):**
   - Kiểm tra build TypeScript (`bun run build`).
   - Kiểm tra tính toán chính xác với cả ảnh khổ ngang, khổ dọc và ảnh vuông.

---

## 3. Tiêu chí hoàn thành (Acceptance Criteria)
- [x] Giao diện có khối "Kích thước thông dụng" nằm dưới "Scale nhanh theo tỷ lệ %".
- [x] Có đủ 5 nút: `2048`, `1200`, `1000`, `890`, `850`.
- [x] Bấm vào bất kỳ nút nào sẽ tự set cạnh lớn nhất về số đó, cạnh còn lại tự co theo đúng tỉ lệ.
- [x] Khóa tỷ lệ tự động được bật để tránh vỡ méo hình.
- [x] Không gây lỗi TypeScript hoặc lỗi runtime (`bun x tsc --noEmit` Passed).
