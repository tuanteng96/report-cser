# Ghi chú ReportsAI (cập nhật 15/11/2026)

Đọc file này đầu phiên mới thay cho lịch sử cũ.

## Môi trường
- Dự án: `d:\Codeing\report-cser` (CRA, React 18, pnpm). Node/pnpm cài qua winget; PowerShell 5.1 (không có `&&`).
- Làm mới PATH: `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`
- Dev server chạy nền cổng 3002, log: `%TEMP%\report-cser-dev.log`. Vào trang bằng menu (gõ thẳng URL bị 404).
- Test: `$env:CI="true"; npx react-scripts test --watchAll=false src/features/ReportsAI`
- Sửa định dạng: `npx eslint --fix <đường dẫn>`
- Build: `pnpm build` → thư mục `build` (homepage `/App23/`). Lên server: chép TOÀN BỘ nội dung `build` (cả `static`) vào `app23`, ghi đè, Ctrl+F5.
- Token dev nằm trong `src/features/Auth/AuthSlice.js` (đừng in ra). Danh sách 14 cơ sở dev đã cập nhật theo server.
- Bản tham khảo trang mẫu act20=daily: `d:\Codeing\cser-report-preview` (Vite). Có token thật bị commit trong `Auth.jsx` — đã báo người dùng.

## Cách làm việc người dùng muốn
- Trả lời tiếng Việt, ngắn. Chỉnh nhỏ (chữ/màu/vị trí): chỉ sửa + kiểm tra biên dịch, không chạy toàn bộ test. Chỉ build khi được yêu cầu.
- Luôn áp dụng skill `ui-ux-pro-max` cho việc giao diện.

## Các trang đã làm (src/features/ReportsAI/pages)
- **DaysByCustomer** — Báo cáo ngày / Theo khách hàng (`/bao-cao-ngay/theo-khach-hang`). Giao diện theo HTML "Sổ giao dịch" (thẻ khách, đơn trái, cột phụ 320px). Bản lưu cũ: `_backup-v1..v5`. Menu "Khách hàng" gốc đã ẩn.
- **SalesNewDebt** — Bán hàng (Bán mới, Thanh toán nợ), API `dQuery@BaoCaoThanhToanDonHang`.
- **DaysStockOverview** — Báo cáo ngày / Tổng quan cơ sở (`/bao-cao-ngay/tong-quan-co-so`), đang làm, chi tiết bên dưới.
- (Báo cáo phân tích `/bao-cao-ngay/phan-tich` đã làm rồi xoá theo yêu cầu 15/11/2026.) Lưu ý còn đúng: `getMemberDay` lọc nhiều ngày trả dòng khách trùng (cùng mã đơn, khác CreateDate).

## Tổng quan cơ sở
**Bộ lọc** (`components/Filter/Filter.js`, dùng chung): Ngày + Cơ sở chọn nhiều (`StockIDs`, trống = mọi cơ sở được xem), nút Làm mới chỉ icon, không Xuất Excel. Menu cơ sở mở ra ngoài khung (portal) để lăn chuột được. Bộ lọc báo danh sách cơ sở qua `onStocksListChange`.

**API** (`api/reports.api.js`):
- `getDailyGroups(type, body)` → `/api/v3/r23/hang-ngay/tong#<type>`; type: khach-hang, ban-hang, dich-vu, thu-chi, nhan-vien. Body `{Type, StockID:[..], DateStart, DateEnd}` ngày `DD/MM/YYYY`. Kết quả `Items[].Groups[].Keys[].Values[]` (Values theo từng cơ sở).
- `getDailyList(type, body+GroupTitle[+Key])` → `/hang-ngay/danh-sach#<type>`, `result.List=[[row]]`, cột tên tiếng Việt.
- `urlAction(body)` → `/api/v3/UrlAction@invoke` (đọc giọng nói Google; cấu hình `GlobalConfig.Admin.TextToSpeech`="google").

**Dữ liệu tải khi vào trang** (`index.js`, chống gọi trùng StrictMode): 5 khối + `orders` (Đơn hàng mới: rows + 12 khung 2 giờ) + `debts` (danh sách Thu nợ) + `week` (khách 7 ngày, thứ Hai→CN). `fetchList(type, GroupTitle, Key)` gọi khi bấm popup.

**File**: `query.js` (gộp dữ liệu, `buildKpis`, biểu đồ), `Sections.js` (các khối), `Charts.js` (HourChart, WeekChart, Donut), `DetailPopup.js` (popup bảng + biểu đồ phân chia; xử lý dữ liệu trong `popupTable.js`: bỏ cột trống/toàn 0/kỹ thuật, cột giống nhau lên tiêu đề, gộp Tên+SĐT→Khách hàng, tiền đơn→Phải thu/Đã thanh toán, TM+CK+Quẹt thẻ→Số tiền; dải số tổng, tìm kiếm, Gom theo khách/ngày/cơ sở/loại, nút "Đủ cột" xem bảng gốc, dòng Tổng, sắp xếp cột), `StockOverviewView.js` (menu dính + lưới), `SpeechButton.js`/`speech.js` (nút Play), `DaysStockOverview.css` (tiền tố `so-`, phông Be Vietnam Pro + Inter nạp trong public/index.html). `OverviewBlocks.*` là bản 5 khối cũ, không dùng. `CompareStocks.js` — popup so sánh giữa các cơ sở (API `getBaselineSales` → `/hang-ngay/tien-vi-datlich-dichvu`, cột TM/CK/QT · Ví/Thẻ tiền · Đặt lịch · Dịch vụ, sắp xếp theo cột).

**Bố cục hiện tại** (lưới 12 cột, tối đa 1320px; menu dính top 110px / 55px khi <1200):
1. Dải 6 ô (`buildKpis`): Thực thu bán hàng (nền xanh = TM/CK/QT đơn mới + TM/CK/QT* thu nợ) · Thực thu N đơn mới (phụ: Ví & Thẻ tiền) · Thu nợ (TM/CK/QT*, phụ: N đơn hàng = Qty) · Còn nợ từ đơn mới (phụ: Khấu trừ = Khấu hao KTT, Hoàn trả) · Dịch vụ thực hiện (tím, phụ: "Đặt lịch: X [ Không đến: Y ]", Y = không đến + hủy) · Khách mới (= Khách tạo mới, "[ N đến từ online ]", phụ: chỉ mua + mua&DV khách phát sinh giao dịch).
2. **Doanh số bán hàng** (8): 3 ô bấm được Nguyên giá / Giảm giá / Doanh số → popup Đơn hàng mới. Trái: Phương thức thanh toán (TM/CK/QT, Ví, Thẻ tiền, Còn nợ lại). Phải: Cơ cấu doanh số — biểu đồ tròn trái + 3 phần phải (% một cột); bấm phần → popup chi tiết theo Key; bấm biểu đồ → popup toàn bộ "Chi tiết bán hàng"; popup này có cột phải biểu đồ tỉ lệ theo "Tên"/"Tổng Giá bán" (gộp "Khác" khi >8). Cuối khối: Thu nợ — ô TM/CK/QT · Ví · Thẻ tiền · Tổng (chỉ 1 phương thức có tiền → chỉ ô Tổng), bấm → popup Thu nợ.
3. **Khách hàng** (4, cùng hàng): 3 nhóm, không có dòng "Tổng khách hàng".
4. **Theo khung giờ** (12): tab Doanh thu / Số đơn.
5. **Thu chi** (4) + **Khách hàng 7 ngày** (8).
6. **Dịch vụ** (5) + **Nhân viên** (7).

Menu: Tổng quan · Bán hàng · Khách hàng · Theo khung giờ · Thu chi · Dịch vụ · Nhân viên (thứ tự theo trang để sáng đúng khi cuộn).
