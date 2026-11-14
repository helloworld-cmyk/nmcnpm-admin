Đã rà soát route `src/app/(admin)/tong-quan`, toàn bộ API/types/TanStack hooks và store hãng; đối chiếu controller/service/repository/DTO cùng hợp đồng tại backend `ViVuViet-backend`. Đây là rà soát source tĩnh: không chạy UI/browser hoặc test/lint trong lượt này.

## Kết luận ngắn

Màn Tổng quan **đã nối đủ sáu endpoint thật**: summary, trips theo ngày, top tài xế, chuyến hôm nay, top tuyến, sự cố đang mở. Không thấy mock danh sách/KPI hardcode hay endpoint hiển thị nào còn thiếu. Hợp đồng DTO chính nhìn chung khớp backend.

Các rủi ro đáng xử lý: tiêu đề/kỳ thống kê gây hiểu nhầm, giá trị vé bị gọi là doanh thu dù chưa phải tiền thực thu, giờ/ngày phụ thuộc timezone trình duyệt thay vì hãng, lỗi/tải dở của 5 query phụ bị biến thành empty state; thêm giới hạn 10 dòng bị trình bày như tổng số.

---

## 1. Còn chỗ nào dùng mock/local data không?

- Không thấy dữ liệu mẫu tĩnh. `useTongQuanDashboard` gọi sáu query qua API hooks tại `src/app/(admin)/tong-quan/_hooks/use-tong-quan-dashboard.ts:32-37`; mỗi hook gọi endpoint tương ứng trong `src/api/tong-quan/api/`.
- `TRIP_STATUS_META`, `INCIDENT_STATUS_META`, nhãn sự cố và định dạng số/ngày trong `src/app/(admin)/tong-quan/_utils/map-dashboard.ts:15-57,165-172,261-285` là mapping/format UI, không phải mock nghiệp vụ.
- Ngày header được tính từ đồng hồ/múi giờ máy người dùng tại `src/app/(admin)/tong-quan/_components/dash-head.tsx:18-29`; đây là derived local value, nhưng có thể lệch ngày hãng (xem mục 6).

## 2. Chỗ nào chưa ghép API?

**Không có khối hiển thị chính nào chưa nối.** Màn gọi:

| Khối | Endpoint | Bằng chứng FE |
|---|---|---|
| KPI | `/dashboard/summary` | `src/api/tong-quan/api/get-summary.ts:6-18` |
| Biểu đồ chuyến/giá trị vé | `/dashboard/trips` | `src/api/tong-quan/api/get-trip-points.ts:9-21` |
| Top tài xế | `/dashboard/top-drivers` | `src/api/tong-quan/api/get-top-drivers.ts:9-21` |
| Chuyến hôm nay | `/dashboard/today-trips` | `src/api/tong-quan/api/get-today-trips.ts:9-20` |
| Top tuyến | `/dashboard/top-routes` | `src/api/tong-quan/api/get-top-routes.ts:6-19` |
| Sự cố mở | `/dashboard/open-incidents` | `src/api/tong-quan/api/get-open-incidents.ts:9-20` |

Biểu đồ đã nhận revenue trực tiếp từ `/dashboard/trips` và đổi VND sang triệu đồng tại `src/app/(admin)/tong-quan/_utils/map-dashboard.ts:123-135`; **không cần gọi thêm** `/reports/revenue` chỉ để vẽ đường doanh thu. Từng endpoint được gọi qua query tương ứng ở `use-tong-quan-dashboard.ts:32-37`.

## 3. Còn thiếu API nào?

- Không thiếu endpoint cho các panel hiện có. Backend khai báo đúng sáu endpoint dashboard trong `ViVuViet-backend/src/main/java/com/example/Vi_vu_Viet/Controller/Trip/DashboardController.java:47-128`.
- Không thấy nhu cầu CRUD/xử lý sự cố trong phạm vi màn Tổng quan; panel hiện chỉ đọc danh sách và điều hướng sang `/chuyen` (`src/app/(admin)/tong-quan/_components/open-incidents-panel.tsx:33-36`).
- Endpoint doanh thu chi tiết/báo cáo vẫn tồn tại cho route Doanh thu, nhưng không bắt buộc phải gọi trong dashboard vì endpoint biểu đồ đã trả revenue (`DashboardController.java:61-73`, `src/app/(admin)/tong-quan/_utils/map-dashboard.ts:127-135`).

## 4. API có trường nào bị thiếu/lệch không?

**Không phát hiện mismatch type/DTO trọng yếu trong sáu response đang dùng.** FE khai báo đủ các field được map trong `src/api/tong-quan/api/types.ts:12-146`; DTO backend tương ứng tại `ViVuViet-backend/src/main/java/com/example/Vi_vu_Viet/dto/Response/Company/` khớp tên và nullability chính.

Các field có trong hợp đồng nhưng chưa được tận dụng/giải thích trên UI:

- `DashboardSummaryResponse.actualCollected` và `ticketValueNote` có trong type (`src/api/tong-quan/api/types.ts:40-43`) và backend xác định `actualCollected=false` (`DashboardServiceImpl.java:110-112`), nhưng không được map ra UI. Điều này góp phần làm nhãn “Doanh thu” dễ bị hiểu là tiền đã thu.
- `draftTrips` và `terminatedTrips` được backend trả (`DashboardSummaryResponse.java:15-23`) nhưng không có KPI riêng; tổng chuyến vẫn tính mọi trạng thái. Bốn nhóm trạng thái hiển thị không cộng đủ `totalTrips` nếu có chuyến nháp/chấm dứt.
- Các field `ticketCount`/`byStatus` của điểm biểu đồ có type (`src/api/tong-quan/api/types.ts:46-52`) nhưng chart hiện chỉ dùng `date`, `revenue`, `totalTrips` (`map-dashboard.ts:127-135`). Không gây sai dữ liệu hiện tại, nhưng chưa dùng được breakdown vé/trạng thái.

## 5. File/code nào thừa hoặc không có tác dụng?

- Không phát hiện file component/API/hook riêng của Tổng quan không được gọi. Sáu API functions được hook import; hook dashboard được component gọi (`tong-quan-dashboard.tsx:5,21-35`).
- Một số field response chưa dùng được liệt kê ở mục 4; chưa đủ cơ sở để kết luận cả endpoint/type là dead code.
- `DashboardRangeQuery`/`TopRoutesQuery` cho phép lọc ngày nhưng hook dashboard hiện không truyền query (`use-tong-quan-dashboard.ts:32-37`), nên các nút/chọn kỳ chưa có trên UI. Đây là giới hạn tính năng/kỳ hiển thị, không phải API chết.

## 6. Vấn đề khác, theo mức độ

### P1 — Số liệu dễ bị hiểu sai

1. **“Doanh thu” đang biểu thị giá trị vé, không phải tiền thực thu.** Backend ghi rõ giá trị vé CONFIRMED và `actualCollected=false` (`ViVuViet-backend/src/main/java/com/example/Vi_vu_Viet/Service/Trip/Implement/DashboardServiceImpl.java:110-112`; `DashboardController.java:61-63`). Nhưng chart gắn nhãn “Doanh thu (triệu đ)” và tooltip cũng “Doanh thu” (`src/app/(admin)/tong-quan/_components/revenue-chart.tsx:109-117,232-237`); Top tài xế hiển thị `revenue` không kèm chú giải (`top-drivers-panel.tsx:67-70`). Dùng “Giá trị vé đã xác nhận” hoặc hiện ghi chú `ticketValueNote`/`actualCollected` để tránh nhầm với tiền đã thanh toán.

2. **Dashboard trộn nhiều kỳ nhưng tiêu đề làm người xem tưởng tất cả là số hôm nay.** Header ghi “Sức khoẻ nền tảng hôm nay” (`dash-head.tsx:34-36`) và vùng KPI có nhãn truy cập “Chỉ số chính hôm nay” (`kpi-stats.tsx:7-8`). Trong khi summary/trip points/top drivers không truyền `from/to`, backend mặc định 14 ngày gồm hôm nay (`DashboardServiceImpl.java:393-399`, `DashboardController.java:47-86`); top tuyến mặc định toàn thời gian (`DashboardController.java:101-115`); chỉ chuyến hôm nay dùng ngày hiện tại. `TopRoutesPanel` chỉ ghi tiêu chí giá trị vé, không ghi all-time (`top-routes-panel.tsx:29-36`). Cần công khai kỳ riêng của từng khối hoặc thêm bộ lọc kỳ dùng chung và truyền cùng khoảng ngày cho các query phù hợp.

### P2 — Sai khác timezone và trạng thái tải/lỗi

3. **Giờ chuyến và ngày header theo timezone máy quản trị, không chắc là timezone hãng.** Backend trả `departureAt` có offset theo timezone hãng (`DashboardTodayTripResponse.java:20-28`, `DashboardServiceImpl.java:235-256`). FE parse bằng `new Date(iso)` rồi gọi `getHours()/getMinutes()` theo timezone local trình duyệt (`map-dashboard.ts:187-191`), và header cũng dùng `new Date().toLocaleDateString("vi-VN")` mà không chỉ định timezone (`dash-head.tsx:18-25`). Khi admin ở timezone khác, giờ khởi hành/ngày “hôm nay” có thể khác với khái niệm hôm nay của hãng. Hiển thị theo timezone hãng hoặc giữ giờ local đã mã hóa trong offset API.

4. **Lỗi/tải dở của năm query phụ bị hiển thị như dữ liệu rỗng.** Hook chỉ lấy trạng thái loading/error từ `summaryQuery` (`use-tong-quan-dashboard.ts:88-90`); dữ liệu các query còn lại mặc định map `data ?? []` (`:43-61`) và component vẫn render cả panel (`tong-quan-dashboard.tsx:61-90`). Nếu `/dashboard/top-routes` hoặc endpoint phụ lỗi/chưa trả về trong khi summary thành công, người dùng thấy “chưa có dữ liệu” thay vì lỗi/thử lại. Thêm trạng thái loading/error/refetch theo từng panel hoặc tổng hợp trạng thái của cả sáu query.

5. **Các bộ đếm trạng thái KPI không đối soát với tổng chuyến.** `mapSummaryToKpis` hiển thị tổng, đang thực hiện, đã lên lịch, hoàn thành, huỷ nhưng bỏ draft/terminated (`map-dashboard.ts:60-120`); backend `totalTrips` vẫn gồm cả draft và terminated (`DashboardRepository.java:50-61`). Khi có các trạng thái này, bốn nhóm hiển thị cộng lại ít hơn tổng; share từng nhóm lại chia cho tổng gồm cả hai (`map-dashboard.ts:61-64`). Cân nhắc thêm nhóm hoặc ghi rõ mẫu số/phạm vi trạng thái.

6. **Số dòng trả về bị ghi như tổng số toàn hãng.** `/dashboard/today-trips` mặc định `limit=10` (`DashboardController.java:89-99`), nhưng subtitle hiển thị `${rows.length} chuyến khởi hành` (`today-trips-panel.tsx:41-43`). Danh sách sự cố cũng mặc định limit 10 (`DashboardController.java:118-128`) trong khi subtitle ghi `${rows.length} sự cố cần xử lý` (`open-incidents-panel.tsx:29-31`). Với trên 10 bản ghi, copy tạo ấn tượng đó là tổng thực. Đổi thành “10 chuyến gần nhất/đầu tiên” hoặc backend trả tổng count riêng.

### P3 — Trợ năng

7. **Biểu đồ gắn `role="img"` lên SVG nhưng bên trong lại có các điểm tương tác `role="button"`.** SVG được khai báo ảnh đơn (`revenue-chart.tsx:137-143`), còn các circle con nhận focus và vai trò button (`:200-215`). Cấu trúc này có thể khiến công nghệ hỗ trợ coi các nút là nội dung trình bày của ảnh. Tách vùng mô tả biểu đồ khỏi các điểm tương tác, hoặc cung cấp bảng/danh sách dữ liệu thay thế có thể truy cập bằng bàn phím và screen reader.

## Thứ tự xử lý đề xuất

1. Sửa copy “Doanh thu” thành “Giá trị vé đã xác nhận”/hiển thị chú giải không phải tiền thực thu; làm rõ kỳ 14 ngày, hôm nay và all-time theo từng panel.
2. Format ngày/giờ theo timezone hãng, không theo timezone máy người xem.
3. Tách loading/error cho từng query dashboard để lỗi một API không bị trình bày như empty state.
4. Hiển thị đầy đủ phạm vi trạng thái KPI và phân biệt số trang/limit với tổng bản ghi.
5. Rà lại semantics trợ năng cho biểu đồ SVG tương tác.

## Kiểm chứng và giới hạn

Đã đối chiếu source FE với controller/service/repository/DTO backend và contract `ViVuViet-backend/scripts/dashboard-api-contract.md`. Chưa chạy trình duyệt, lint, typecheck hoặc test; không xác nhận hành vi runtime.
