Đã rà soát route `src/app/(admin)/doanh-thu`, lớp API `src/api/doanh-thu`, store `src/global-states/doanh-thu-store.ts`, đối chiếu backend `../ViVuViet-backend` (controller + service + DTO + repository). Không sửa code, không chạy app; chỉ đọc mã nguồn.

`npx tsc --noEmit` và `npx eslint "src/app/(admin)/doanh-thu" src/api/doanh-thu src/global-states/doanh-thu-store.ts` đều **pass**. Vì vậy các vấn đề dưới đây là lỗi logic/hợp đồng/nhãn nghĩa, không phải lỗi type hay lint.

> Ghi chú phạm vi: theo AGENTS §3, `design/admin/` là nguồn tham chiếu chuẩn, nhưng trong working tree hiện **không có thư mục `design/`** (bị `.gitignore:38` bỏ qua). Vì vậy báo cáo này không đối chiếu bố cục DESIGN_RULES mà chỉ đối chiếu backend thật + code FE.

## Kết luận ngắn

Màn Doanh thu **đã nối toàn bộ 3 API thật** (report / by-route / reconciliation), **không còn mock tĩnh**. Nhưng nội dung đang trộn **hai định nghĩa doanh thu khác nhau** trên cùng màn hình: 3 thẻ KPI + biểu đồ lấy **giá trị vé `CONFIRMED`** (`ticketValue`, không phải tiền thực thu), còn khối "Theo tuyến" và "Đối soát" lấy **tiền thực thu** (`collected_amount`). Hệ quả: nhãn "Doanh thu thực thu" **sai nghĩa**, badge biểu đồ "Chỉ vé Đã thu" **sai sự thật**, tổng theo tuyến ≠ thẻ KPI. Ngoài ra bảng đối soát chỉ trả tối đa 6 chuyến nhưng UI trình bày như đầy đủ, kỳ mặc định ghim lúc tải module, và một số field backend (driver wage, analytics) không được dùng/hiển thị.

---

## 1. Còn dùng mock / dữ liệu tĩnh / dữ liệu suy diễn không?

**Không có mảng mock tĩnh** kiểu danh sách doanh thu mẫu. Không có `useState` gán dữ liệu cứng, không còn nhánh `setOverride` facade. Tất cả số liệu đều lấy từ API; các con số hiển thị là tính toán trên dữ liệu server:

- `_components/summary-cards.tsx:36-39`: `avgTicket = Math.round(ticketValue / tickets)` — tính ở client (hợp lý, API không trả giá vé trung bình).
- `_hooks/use-doanh-thu-by-route.ts:28-39`: `share` (tỷ lệ đóng góp) và `total` tính ở client bằng cách cộng & chia lại `collectedRevenue` do server trả. Đây là **dữ liệu suy diễn** nhưng đúng bản chất; lưu ý tổng này khác tổng thực thu trong `analytics` của backend ở một số trường hợp (xem mục 4).
- `_components/recon-table.tsx:147-153`: cột "Chênh lệch" của dòng **Tổng cộng** tính ở client bằng `totals.collectedRevenue − Σ rows.expectedRevenue`, **không** phải `totals` của backend và cũng không bằng tổng `difference` từng dòng theo cách BE tính (xem mục 6 — P1 #2).
- `_data/doanh-thu.ts`: chỉ chứa 2 hàm format (`formatVND`, `formatMillions`), không phải mock. Theo AGENTS §7.1, hàm định dạng nên nằm ở `_utils/` chứ không phải `_data/` (đặt sai chỗ, xem mục 5).

Runtime (theo mã nguồn): khi vào `/doanh-thu` với `companyId` hợp lệ, màn gọi **3 request song song**, không N+1:
`GET /bus-companies/{id}/reports/revenue`, `GET …/reports/revenue/by-route`, `GET …/reports/revenue/reconciliation` (`use-doanh-thu-report.ts:19`, `use-doanh-thu-by-route.ts:26`, `use-doanh-thu-reconciliation.ts:49`).

---

## 2. Chỗ nào chưa ghép API?

**Ba khối chính đều đã ghép API thật.** Các khoảng trống còn lại là **tham số không truyền** và **field không dùng**, không phải "chưa gọi":

- **Không truyền `routeId`**: cả 3 hook chỉ truyền `{ from, to }` (`use-doanh-thu-report.ts:19`, `use-doanh-thu-by-route.ts:26`, `use-doanh-thu-reconciliation.ts:49`). `RevenueReportQuery`/`RevenueAnalyticsQuery` có `routeId` (`api/doanh-thu/api/types.ts:6-18`) và cả 3 endpoint backend nhận `route_id` (`DashboardController.java:133-146,147-159,160-175`). Không có UI lọc theo tuyến nên trường này bị bỏ phí.
- **Không truyền `status`**: `getRevenueReportAPI` hỗ trợ `status` (`get-revenue-report.ts:14-18`), backend mặc định `CONFIRMED` (`DashboardServiceImpl.java`, `selectedStatus = status == null ? TicketStatus.CONFIRMED`). FE không có bộ chọn trạng thái vé → luôn xem giá trị vé CONFIRMED, đúng với thiết kế "chỉ vé đã xác nhận" nhưng không thể xem HOLDING/CANCELLED.
- **Không truyền `limit`** cho đối soát (`use-doanh-thu-reconciliation.ts:49`): backend mặc định `limit = 6` (`DashboardController.java:167`, `RevenueAnalyticsService.java:60`). FE không có phân trang và **không biết đang chỉ thấy 6 chuyến** → xem mục 6 — P1 #1.
- **`analytics` bị bỏ hoàn toàn**: `RevenueReportResponse.analytics` (`api/doanh-thu/api/types.ts:107`, backend `RevenueAnalyticsResponse.java`) chứa `collectionRate`, `cancelledTickets`, `noShowTickets`, `completedTrips`, `departedTrips`, `driverWages`, `missingDriverWages`, `estimatedProfit`, `days`, `routes`, `reconciliation`. FE chỉ dùng `periods`, các field `*ChangePct`, `note`, `actualCollected`, `tickets`, `ticketValue`; **không đọc `analytics`**. Thực tế FE gọi thêm 2 API riêng (`by-route`, `reconciliation`) để lấy dữ liệu mà `analytics` đã chứa sẵn trong response báo cáo → **gọi thừa 2 request** có thể bỏ nếu dùng `analytics` (xem mục 6 — P2).

---

## 3. Còn thiếu API nào?

- **Endpoint danh sách chuyến đối soát có phân trang** (`page`/`size`/`total`) — hiện `limit` trần (`RevenueAnalyticsService.java:60` `trips.stream().limit(limit)`), không có cách lấy trang 2 hay biết tổng số chuyến có chênh lệch. `mismatchedTrips` cũng chỉ đếm trong `limit` dòng (`RevenueAnalyticsService.java:72`).
- **Trả về cờ "còn dữ liệu / tổng số chuyến"** kèm đối soát để UI biết đang cắt bớt.
- **API doanh thu theo ngày dạng thực thu** đã có trong `analytics.days` — không thiếu, nhưng nếu giữ kiến trúc gọi riêng thì nên tách endpoint daily thay vì buộc FE lấy qua `report` (hiện biểu đồ dùng `periods` = giá trị vé, không phải thực thu).
- **Bộ lọc danh mục tuyến cho màn này**: không có API riêng, nhưng đã có `GET /routes` dùng chung (`src/api/tuyen-duong/tanstack/use-routes.ts`) — nên tận dụng nếu bổ sung lọc theo tuyến.
- (Tùy chọn) **API tính giá vé trung bình / số liệu so sánh kỳ** đã có qua `previousRevenue`, `previousTickets`, `*ChangePct` — không thiếu.
- Không thiếu endpoint CRUD: màn này chỉ đọc.

---

## 4. API có trường nào bị thiếu/lệch không?

Không thiếu field cơ bản; lệch nằm ở **nghĩa của field** và **field thừa/không dùng**.

| Hướng | Field/hợp đồng | Thực trạng |
|---|---|---|
| BE có, FE type có, **UI bỏ** | `driverWage` (từng chuyến), `driverWages` (tổng) | Có trong view-model (`use-doanh-thu-reconciliation.ts:29,37,62,73`) nhưng **không render** ở `recon-table.tsx` — bảng không có cột lương tài xế / lợi nhuận. |
| BE có, FE type có, UI bỏ | toàn bộ `analytics` | Xem mục 2. |
| BE có, FE type có, UI bỏ | `status`, `currency`, `previousRevenue`, `previousTickets` (report) | Không hiển thị ở đâu; `previousRangeLabel` chỉ dùng cho dòng phụ thẻ "Kỳ báo cáo". |
| **Nghĩa lệch** | `ticketValue` vs "Doanh thu thực thu" | Backend ghi rõ `actualCollected=false`, `note="… không thể hiện tiền thực thu vì chưa tích hợp thanh toán"`; `ticketValue` = **tổng `fare_amount` của vé `CONFIRMED`** (`DashboardServiceImpl.java`, `getRevenueSummary`). Nhưng FE đặt nhãn thẻ là "Doanh thu thực thu" (`summary-cards.tsx:43`) và lấy `report.note` làm phụ đề (`summary-cards.tsx:47`) → thẻ vừa **sai nhãn** vừa **tự in câu bác bỏ chính nhãn của nó**. |
| **Nghĩa lệch** | badge biểu đồ "Chỉ vé Đã thu" | `revenue-chart.tsx:62-65` + `map-report.ts:72-76`: `days[].vnd = period.ticketValue`, tức **giá trị vé** chứ không phải "đã thu" (thực thu là `collected_amount`). Nhãn gây hiểu nhầm tiền đã về. |
| **Nghĩa lệch** | `mismatchedTrips` / "Tổng cộng" bảng | Chỉ tính trên `limit` dòng (`RevenueAnalyticsService.java:72`); thiếu tổng toàn kỳ → header `mismatchedTrips > 0 ? "N chuyến lệch tiền cần rà soát"` (`recon-table.tsx:37-39`) ngầm hiểu là toàn bộ. |
| BE trả `null` nhưng UI coi 0 | `driverWage`/`driverWages` = `null` khi có chuyến thiếu lương | Không crash vì không render, nhưng nếu thêm cột phải xử lý `null`. |
| BE thiếu cho UI | `limit`/pagination tổng | Xem mục 3. |
| BE có, dùng sai đơn vị hiển thị | `analytics.days` là **thực thu theo ngày** nhưng biểu đồ dùng `periods` (giá trị vé) | Hai nguồn ngày khác nghĩa; xem mục 6 — P1 #3. |

Kiểu type FE khớp đúng DTO BE: `RevenueReportResponse`/`RevenueAnalyticsResponse`/`RevenueReconciliationResponse` (đối chiếu `api/doanh-thu/api/types.ts:40-108` với `dto/Response/Company/*.java`) — **không lệch kiểu**, chỉ lệch ngữ nghĩa sử dụng.

---

## 5. File/code nào thừa, không có tác dụng?

Tất cả component/hook/utils đều được import (đã kiểm call site). Dead code & đặt sai chỗ:

- **`RevenueReportResponse.analytics` + các type con**: `RevenueAnalyticsResponse`, `RevenueDailyResponse` (`api/doanh-thu/api/types.ts:28-31,71-88,107`) — không nơi nào đọc (grep chỉ thấy định nghĩa). Hoặc dùng hoặc bỏ khỏi type nếu không có kế hoạch.
- **`driverWage`/`driverWages`** trong view-model `use-doanh-thu-reconciliation.ts:29,37,62,73` — map nhưng không render (`recon-table.tsx` không có cột).
- **CSS chết** `_components/doanh-thu.css:40-48`: `.stat-delta .icon`, `.kpi-icon .icon` — không có class `stat-delta`/`kpi-icon` nào trong toàn `src/` (grep 0 kết quả ở `*.tsx`). Thẻ đã chuyển sang `ICON_WRAP` inline (`summary-cards.tsx:20-21`).
- **Đặt sai chỗ**: `_data/doanh-thu.ts` chỉ chứa hàm format (`formatVND`, `formatMillions`), không phải dữ liệu → AGENTS §7.1 yêu cầu đặt ở `_utils/`.
- **`.admin-card*` định nghĩa trong route CSS** (`doanh-thu.css:5-38`): chỉ dùng 1 route nên đúng §1.4, nhưng trùng ý tưởng `card` của `globals.css` (không dùng chéo) — không phải dead code, chỉ là class riêng route hợp lệ.
- **Không có file nào thừa hoàn toàn**: `page-head.tsx`, `period-filter.tsx`, `summary-cards.tsx`, `revenue-chart.tsx`, `route-breakdown.tsx`, `recon-table.tsx`, cả 3 hook, `map-report.ts`, `doanh-thu-store.ts` đều được import và render/đọc.

---

## 6. Các vấn đề khác, theo mức độ

### P1 — Sai nghiệp vụ / UX nghiêm trọng

1. **Bảng đối soát cắt còn 6 chuyến nhưng trình bày như đầy đủ, không phân trang, không báo cắt.**
   - FE không truyền `limit` (`use-doanh-thu-reconciliation.ts:49`) → backend trả 6 dòng mới nhất (`RevenueAnalyticsService.java:60`, `DashboardController.java:167` default 6).
   - `recon-table.tsx:37-54` hiển thị "N chuyến lệch cần rà soát" và badge đỏ theo `mismatchedTrips` — số này **chỉ đếm trong 6 dòng** (`RevenueAnalyticsService.java:72`) nên **đếm thiếu** khi kỳ có hơn 6 chuyến lệch.
   - "Tổng cộng" (`recon-table.tsx:128-156`) là tổng của 6 dòng, **không phải tổng kỳ** → người dùng dễ tưởng đã đối soát toàn kỳ.
2. **Cột "Chênh lệch" của dòng Tổng cộng không nhất quán với từng dòng.**
   - Từng dòng: `difference = collectedRevenue − expectedRevenue` (BE `RevenueAnalyticsService.java:66`), nhưng `expectedRevenue` của BE chỉ cộng vé **đã thu** (`t.getCollected_at() != null`, dòng 63) — nghĩa là expected dùng **giá vé niêm yết của vé đã thu**, không phải "dự kiến toàn bộ vé đã đặt".
   - Dòng tổng FE tính `totals.collectedRevenue − Σ rows.expectedRevenue` (`recon-table.tsx:147-153`) — về số học bằng tổng difference của 6 dòng, nhưng cột "Dự kiến" trong footer lại hiển thị `—` (`recon-table.tsx:143`) nên người dùng không đối chiếu được phép tính; nếu chỉ có 1-2 dòng lệch, ô tổng "Khớp" trong khi vẫn còn badge "N lệch" (do `mismatchedTrips` đếm riêng) → **mâu thuẫn hiển thị**.
3. **Thẻ KPI, biểu đồ và khối theo tuyến/đối soát dùng hai định nghĩa doanh thu khác nhau, đặt cạnh nhau trên cùng màn.**
   - Thẻ "Doanh thu thực thu" = `ticketValue` (giá vé, `summary-cards.tsx:43-46`), trong khi backend note chính là "không thể hiện tiền thực thu" (`DashboardServiceImpl.java`, `setNote`) và `actualCollected=false`.
   - Khối "Doanh thu theo tuyến" (`route-breakdown.tsx:76`) và cột "Thực thu" trong đối soát (`recon-table.tsx:121`) = `collectedRevenue` (tiền thực thu). Nên **tổng theo tuyến lệch với thẻ KPI** cùng kỳ dù cùng nhãn "thực thu". Không có chú thích phân biệt "giá trị vé" vs "tiền đã thu".
4. **Biểu đồ gắn badge "Chỉ vé Đã thu" nhưng vẽ giá trị vé `CONFIRMED`, không phải đã thu** (`revenue-chart.tsx:62-65`, `map-report.ts:72-76`). Đây là nhãn sai sự thật nếu vé CONFIRMED chưa thu tiền (`paymentCollected` null/false).
5. **Kỳ mặc định ghim theo thời điểm tải module** (`doanh-thu-store.ts:31,50-51,63-64`): `DEFAULT_RANGE = rangeFor(DEFAULT_PERIOD)` tính tại thời điểm import module; mở tab qua nửa đêm (hoặc giữ tab qua ngày) thì "Tháng này/Hôm nay" vẫn dùng ngày cũ cho tới khi bấm chọn lại kỳ. Cùng lỗi tư duy với `use-chuyen-lich.ts:21`.

### P2 — Dữ liệu / hiệu năng / hành vi

6. **Gọi thừa 2 request có thể lấy từ `analytics` của báo cáo.** `report.analytics.routes` và `report.analytics.reconciliation` đã có sẵn trong response `/reports/revenue` (`RevenueAnalyticsResponse.java`), nhưng FE gọi thêm `/by-route` và `/reconciliation`. Mỗi lần đổi kỳ = 3 request thay vì 1. (Đánh đổi: tách endpoint cho phép `limit` khác 6 — hiện chưa dùng.) Xem mục 2.
7. **`limit` đối soát hardcode ngầm 6 + không phân trang** (trùng P1 #1): nếu chuyển sang dùng `analytics`, dữ liệu cũng chỉ 6 dòng giống hệt — cần chốt lại hợp đồng số dòng.
8. **Truy vấn đối soát theo `limit` tái tính toàn bộ**: khi `limit ≠ 6`, backend gọi `revenueAnalyticsService.calculate(...)` **lần thứ hai** (sau `dashboardService.getRevenue(...)` đã tính) — 2 lần quét toàn bộ ticket/chuyến (`DashboardController.java:170-171`). FE hiện không dùng nhánh này, nhưng nếu thêm phân trang sẽ nhân đôi tải.
9. **Không có `keepPreviousData`/`placeholderData`**: đổi kỳ → `isLoading` true → 3 khối nhảy về "Đang tải…" thay vì giữ dữ liệu cũ mờ dần; trải nghiệm giật khi chỉnh ngày liên tục (`use-doanh-thu-*.ts` không set `placeholderData`).
10. **`DatePicker` "Từ ngày" / "Đến ngày" không chặn chéo và luôn ép về `tuy-chon`**: `setCustomRange` tự chỉnh `to` khi `from > to` (`doanh-thu-store.ts:72-81`), nhưng UI không thông báo; đổi 1 ô ngày bất kỳ sẽ **âm thầm đổi kỳ** từ "Tháng này" sang "Tuỳ chọn" (`doanh-thu-store.ts:77`) → người dùng mất ngữ cảnh kỳ. Ngoài ra không có `min`/`max` trên `DatePicker` (`period-filter.tsx:45-60`) nên chọn ngày tương lai/tương lai xa vẫn gọi API (backend chỉ chặn `>3660 ngày` — `validateDailyRange`).
11. **Không debounce/không nút "Áp dụng"**: mỗi lần chọn ngày là đổi `from`/`to` trong store → 3 query chạy lại ngay (`period-filter.tsx:45-60`), không gộp. Chọn dải ngày nhiều bước (tháng→ngày) sẽ bắn nhiều request trung gian (react-query huỷ request cũ nhưng vẫn tạo tải).
12. **Thiếu dấu phân cách hàng nghìn cho cột "Đã đặt"/"Đã thu"**: hiển thị số nguyên thuần (`recon-table.tsx:118-119`) không qua `.toLocaleString` — khác với các cột tiền đã format; dữ liệu lớn khó đọc.

### P3 — Nhỏ / a11y / copy

13. **Biểu đồ chỉ tương tác bằng chuột**: hover dùng `onMouseEnter` trên `<rect>` (`revenue-chart.tsx:169-181`), không có `tabIndex`, không có `onFocus`, không có `role="list"`/bảng dữ liệu thay thế. Screen reader chỉ nghe `aria-label` tổng (`revenue-chart.tsx:86`), không truy cập được từng ngày. Người dùng bàn phím/cảm ứng không xem được tooltip.
14. **`aria-hidden="true"` che toàn bộ nhãn trục** (`revenue-chart.tsx:91,104,156`): nhãn ngày/giá trị trục Y bị ẩn với AT, chỉ còn mô tả chung — không có tổng hợp "cao nhất/thấp nhất".
15. **Tooltip dùng `left/top` theo % viewBox, không clamp mép**: điểm đầu/cuối kỳ có thể đẩy tooltip ra ngoài khung (`revenue-chart.tsx:185-197`, `translate(-50%,-130%)`) — tràn mép trái/phải.
16. **Lỗi backend hiển thị nguyên văn** (tiếng Anh) qua `error.message` (`summary-cards.tsx:108-110`, `route-breakdown.tsx:48-50`, `recon-table.tsx:73-76`). Backend trả thông điệp như `"limit must be between 1 and 100"`, `"from must be on or before to"` → hiện thẳng cho admin.
17. **Không có trạng thái "đang tải lại" khi refetch nền** (khác `isLoading`): nút "Thử lại" hoặc refetch thủ công không có spinner; `refetch` đã trả `Promise` nhưng không disable nút → bấm nhiều lần được.
18. **Khối "Theo tuyến" và "Đối soát" tự lặp empty/error/loading** (`route-breakdown.tsx:31-68`, `recon-table.tsx:57-94`) thay vì dùng component/truy vấn chung — trùng lặp mark-up ~3 lần cùng cấu trúc `state-empty`. Nên tách presentational dùng chung (AGENTS: component dùng ≥2 khối UI → gom lại).
19. **Nhãn "Doanh thu theo ngày" không phân biệt nguồn**: biểu đồ dùng `periods` (giá trị vé theo ngày khởi hành), nhưng tiêu đề khối "Đối soát" lại dùng khái niệm "thực thu" — người dùng khó biết hai khối có cùng đơn vị/nguồn hay không (xem P1 #3).
20. **Không có `<caption>` cho bảng đối soát** (`recon-table.tsx:97`); tiêu đề nằm ngoài bảng (`table-title`), có thể chấp nhận được nhưng thiếu liên kết `aria-labelledby` từ `<table>` tới h2.

---

## Ghi chú đối chiếu backend (đã kiểm, không giả định)

- `findReportTrips`/`findReportTickets` loại chuyến `DRAFT`, lọc theo ngày **khởi hành** (`DashboardRepository.java:17-34`) → "doanh thu theo kỳ" thực chất là "giá trị vé theo ngày khởi hành", không phải ngày thu tiền. Copy đối soát "Chênh lệch = tiền mặt thực thu − (số vé đã thu × giá vé)" (`recon-table.tsx:40`) là **không chính xác** với BE: `expectedRevenue` = Σ `fare_amount` của vé có `collected_at` (`RevenueAnalyticsService.java:63`), không phải `số vé đã thu × giá vé` trung bình.
- `changePct` của BE (`DashboardServiceImpl.java:419-423`): `previous=0 & current=0` → 0; `previous=0 & current>0` → `null`. FE `changeVsPrevious` (`map-report.ts:29-38`) xử lý `null` → không hiển thị badge, đúng. Nhưng `pct = 0` sẽ hiện "+0% so với kỳ trước" (nhãn "tăng" dù không đổi) — sai sắc thái nhỏ.
- `departureAt` của đối soát là `LocalDateTime` (BE `RevenueAnalyticsResponse.java:17`), **không có offset**; FE `new Date(iso)` (`use-doanh-thu-reconciliation.ts:13-18`) sẽ diễn giải theo timezone **trình duyệt**, nên giờ khởi hành có thể lệch +7h so với timezone hãng nếu admin mở ngoài VN hoặc máy đặt UTC (khác `DashboardTodayTripResponse.departureAt` là `OffsetDateTime`). Đây là **rủi ro parse ngày**, không phải lỗi hiện thấy trên máy VN.

---

## Thứ tự xử lý đề xuất

1. **P1**: sửa nhãn/nghĩa trên cùng màn — đổi thẻ "Doanh thu thực thu" → "Giá trị vé đã xác nhận" (hoặc chuyển thẻ sang `analytics.collectedRevenue`), badge biểu đồ → "Giá trị vé CONFIRMED", thêm dòng phân biệt "giá trị vé" vs "tiền thực thu".
2. **P1**: chốt hợp đồng đối soát — truyền `limit` tường minh hoặc thêm phân trang; header "N chuyến lệch" phải ghi rõ phạm vi (N trong M chuyến gần nhất); footer "Tổng cộng" ghi rõ là tổng của M dòng.
3. **P1**: sửa copy "Chênh lệch" theo đúng BE; thống nhất cột "Dự kiến" ở footer (hiện dữ liệu thật thay vì `—`).
4. **P1**: thay kỳ mặc định ghim module bằng tính lại khi mở màn / khi đổi kỳ; cảnh báo khi đổi kỳ ngầm sang "Tuỳ chọn".
5. **P2**: cân nhắc bỏ 2 request thừa bằng cách dùng `analytics` (nếu chấp nhận `limit=6`), hoặc giữ tách và thêm phân trang; thêm `placeholderData` khi đổi kỳ; format số cho cột vé.
6. **P3**: dọn CSS chết `.stat-delta/.kpi-icon`, chuyển `_data/doanh-thu.ts` → `_utils/`, gom presentational state dùng chung, bổ sung a11y biểu đồ (bảng dữ liệu ngày, clamp tooltip, focus được), chuẩn hoá thông điệp lỗi.
