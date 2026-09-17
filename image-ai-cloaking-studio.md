# Task: Xây dựng Bộ Khử Dấu Vết Ảnh AI (AI Cloaking Studio) & Cân bằng chiều cao 2 Panel

> **Slug:** `image-ai-cloaking-studio`  
> **Status:** Completed  
> **Assigned Agents:** `project-planner` (Plan) → `frontend-specialist` (Core Implementation) → `devops-engineer` / `test-engineer` (Build & Deploy)

---

## 1. Yêu cầu & Mục tiêu
1. **Lớp hạt nhiễu cảm biến quang học (Luminance-aware Analog Film Grain)**:
   - Thanh trượt 0% - 15% (mặc định gợi ý 3% tự nhiên).
   - Khử hoàn toàn vẻ "nhẵn bóng sáp nhựa" của ảnh AI, đồng thời bẻ gãy cấu trúc pixel của Google SynthID.
2. **Bộ giả lập EXIF Máy ảnh thật (Fake Camera EXIF Spoofer)**:
   - Tạo metadata EXIF chân thực (Sony A7 IV, Canon EOS R5, Fujifilm X-T5, iPhone 15 Pro).
   - Tự động điền ngày giờ chụp thực tế, ống kính, khẩu độ, ISO, tốc độ màn trập.
   - Nhúng trực tiếp vào ảnh JPEG client-side không qua server.
3. **Cắt viền siêu nhỏ (Micro-Edge Crop 1-2px)**:
   - Cạo nhẹ 1-2 pixel ở mép biên để làm lệch hoàn toàn hệ tọa độ lưới pixel watermark.
4. **Cân bằng chiều cao 2 Box (Preview và Settings)**:
   - Sử dụng CSS Grid `items-stretch` và `flex flex-col h-full justify-between`.
   - Vùng xem trước ảnh co giãn `flex-1 min-h-[380px]` giúp 2 box luôn có chiều cao bằng nhau tuyệt đối.

---

## 2. Tiêu chí hoàn thành (Acceptance Criteria)
- [x] Tạo `src/lib/exifEngine.ts` chuẩn nhị phân JPEG APP1 marker `0xFFE1`.
- [x] Nâng cấp `src/lib/imageEngine.ts` với thuật toán tạo hạt film grain và micro-crop.
- [x] Hoàn thiện giao diện Khử Dấu Vết AI trong `src/components/ImageStudio/ImageStudio.tsx`.
- [x] Cân bằng chiều cao 2 box bằng `items-stretch` và `flex-col h-full`.
- [x] TypeScript check và Next.js build passed 100%.
