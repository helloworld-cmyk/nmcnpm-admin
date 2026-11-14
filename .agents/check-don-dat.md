Đã rà soát tĩnh route `src/app/(admin)/don-dat`, API/hooks/types/store, điểm liên kết từ màn khách hàng và đối chiếu contract/controller/service/mapper backend `ViVuViet-backend`. Các vấn đề dưới đây là sai khác logic/hợp đồng và UX; không có kết luận dựa trên chạy thử runtime.

## Kết luận ngắn

Danh sách, bộ đếm tab, thống kê, chi tiết và hủy đơn đều đã gọi API thật; không thấy danh sách mock tĩnh hay API/hook đơn đặt nào không có call site. Vấn đề đáng xử lý: bộ lọc ngày gửi date-only cho backend đòi `LocalDateTime`, UI cho hủy đơn dù chuyến đã bắt đầu và FE bỏ thông tin độ đầy đủ lịch sử. Có thêm sai nhãn thống kê, trạng thái tải/lỗi bộ đếm và một số dead CSS/a11y.

## 1. Còn chỗ nào dùng mock/local data không?

- Không thấy danh sách đơn, thống kê hay chi tiết mock tĩnh. `_data/don-dat.ts` chỉ chứa enum/nhãn tab, số dòng mỗi trang, giới hạn lý do hủy và hàm format tiền.
- Màn gọi API thật: danh sách + đếm trạng thái + thống kê trong `use-don-dat-board.ts:93-107`, chi tiết tại `:122-126`, hủy tại `_hooks/use-don-dat-cancel.ts:46-60`. Endpoint tương ứng nằm trong `src/api/don-dat/api/`.

## 2. Chỗ nào chưa ghép API?

Các luồng chính đã ghép. Tuy nhiên UI chỉ cung cấp tìm kiếm, ngày khởi hành, khách hàng qua deep link và tab trạng thái; các filter API khác như `createdFrom/To`, `routeId`, `tripId`, `driverId`, `passengerTripStatus` chưa có điều khiển trên màn (`src/api/don-dat/api/types.ts:67-82`). Đây là phần chưa có UI nếu nghiệp vụ cần lọc sâu, không phải endpoint chưa tồn tại.

## 3. Còn thiếu API nào?

- Chưa thấy thiếu endpoint CRUD/hủy thiết yếu cho màn hiện tại.
- Backend chưa trả cờ `canCancel` hay `actualDepartureAt`. Hủy còn phụ thuộc trạng thái chuyến và việc chuyến đã có giờ khởi hành thực tế hay chưa, không chỉ trạng thái đơn; FE hiện không đủ dữ liệu trong danh sách để biểu diễn chính xác quyền thao tác (chi tiết ở mục 6). Tốt nhất backend trả cờ khả năng thao tác; nếu FE tự tính thì cần trả đủ dữ liệu và backend vẫn là nơi xác thực cuối.

## 4. API có trường nào bị thiếu/lệch không?

- **FE nhận `historyComplete` nhưng bỏ ở view-model/UI:** backend trả cờ này và ghi `false` khi lịch sử thiếu thời điểm (`ViVuViet-backend/.../dto/Response/Booking/CompanyBookingResponse.java:34-35`, mapper tính tại `.../CompanyBookingResponseMapper.java:113-116`). FE đã khai báo `historyComplete` trong `CompanyBookingResponse` (`src/api/don-dat/api/types.ts:139-172`), nhưng `DonDatDetail`/`mapBookingDetail` không giữ cờ này (`_utils/map-booking.ts:74-112,114-171`); drawer hiển thị lịch sử mà không cảnh báo dữ liệu có thể thiếu (`_components/don-dat-detail-drawer.tsx:249-277`).
- **`TicketResponse.passengerTripStatus` FE khai báo non-null, trong khi DTO backend không đảm bảo non-null ở response:** type FE yêu cầu enum (`src/api/booking/types.ts:32-34`), mapper backend gán trực tiếp thuộc tính entity (`ViVuViet-backend/.../CompanyBookingResponseMapper.java:201-204`), dù entity hiện khai báo cột `nullable=false` và giá trị mặc định `WAITING_PICKUP` (`.../Entity/Trip/Ticket.java:106-109`). Với dữ liệu hợp lệ theo schema, null không được kỳ vọng; tuy vậy type DTO backend cho phép null ngầm, nên cần xác nhận dữ liệu cũ/schema migration trước khi kết luận lỗi runtime. Drawer tra nhãn trực tiếp (`_components/don-dat-detail-drawer.tsx:234-239`); nếu backend có thể trả null thì nên nới type và render fallback.
- Backend summary có `tripStatus` (`CompanyBookingSummaryResponse.java:27-30`), FE type cũng có (`src/api/don-dat/api/types.ts:93-96`), nhưng mapper dòng bảng không giữ trường này (`_utils/map-booking.ts:21-36,39-57`). Chi tiết giữ `trip.status` (`_utils/map-booking.ts:87-94,130-140`), nhưng drawer không dùng nó khi quyết định hiển thị nút hủy; cần cả `tripStatus` lẫn `actualDepartureAt` (hoặc cờ `canCancel`) để tính đủ điều kiện theo backend.

## 5. File/code nào thừa, không có tác dụng?

- `src/app/(admin)/don-dat/_components/don-dat.css:15-23` (`dd-drawer-out`) và `:35-43` (`dd-fade-out`) không có chỗ sử dụng; drawer chỉ tham chiếu animation vào ở `don-dat-detail-drawer.tsx:62,69`.
- Selector mobile `.table.dd-table tbody td[data-label="Mã vé"]` tại `don-dat.css:102-104` không khớp data-label nào trong bảng (`don-dat-table.tsx:118-168`, bắt đầu bằng “Mã đơn”).
- Không phát hiện file/hook/API của domain đơn đặt nào hoàn toàn không có call site; cả hooks/API chính đều được `use-don-dat-board` hoặc `use-don-dat-cancel` dùng.

## 6. Các vấn đề khác, theo mức độ

### P1 — Lọc ngày có khả năng bị backend từ chối hoặc chỉ lọc đúng nửa đêm

`DatePicker` trả chuỗi `YYYY-MM-DD`; toolbar gửi trực tiếp cả hai giá trị (`don-dat-toolbar.tsx:113-127`), board cũng đưa nguyên chuỗi vào query (`use-don-dat-board.ts:80-87`). Backend bind `departureFrom/To` thành `LocalDateTime` theo ISO DATE_TIME (`ViVuViet-backend/.../CompanyBookingFilter.java:43-49`) và so sánh trực tiếp với thời điểm khởi hành bằng hai cận bao gồm (`.../CompanyBookingSpecifications.java:47-50`). Chuỗi date-only không khớp định dạng yêu cầu và có thể bị Spring từ chối; nếu được diễn giải/thay đổi thành `00:00`, `departureTo` sẽ không bao gồm phần còn lại của ngày đã chọn. Cần thống nhất semantics theo ngày: gửi đầu ngày cho `departureFrom` và cận cuối ngày cho `departureTo` khi giữ so sánh inclusive hiện tại, hoặc đổi backend sang cận trên exclusive ở đầu ngày kế tiếp. Toolbar chỉ đặt `min={departureFrom}` cho picker “Khởi hành đến”, không đặt `max={departureTo}` cho picker đầu (`don-dat-toolbar.tsx:113-126`); có thể chọn khoảng đảo ngược, và backend chủ động trả 400 (`.../CompanyBookingServiceImpl.java:194-196`).

### P2 — Nút hủy không kiểm tra chuyến đã bắt đầu

Bảng chỉ khóa hủy với view status `COMPLETED/CANCELLED/EXPIRED` (`don-dat-table.tsx:13-18,113-116`); drawer dùng cùng điều kiện (`don-dat-detail-drawer.tsx:287-293`). Backend chỉ nhận đơn HOLDING còn hạn hoặc CONFIRMED, đồng thời chuyến phải `DRAFT/SCHEDULED` và chưa có `actual_departure_at` (`ViVuViet-backend/.../CompanyBookingController.java:101-108`, `.../CompanyBookingServiceImpl.java:153-165`). Vì vậy đơn CONFIRMED như `BOOKED`, `PICKED_UP` hoặc `NO_SHOW` vẫn có thể hiện nút hủy dù backend sẽ trả 409 khi chuyến đã bắt đầu/không còn trạng thái cho phép. Bảng response có `tripStatus` nhưng view-model bỏ qua; cả summary và detail đều không trả `actualDepartureAt`/`canCancel`. Nên backend trả cờ khả năng hủy nhất quán, hoặc bổ sung đủ dữ liệu để FE chỉ hiển thị dựa trên điều kiện tương đương; backend vẫn phải chặn thao tác.

### P2 — Mô tả sai phạm vi thống kê giá trị vé

Thẻ thống kê ghi “Tổng giá trị vé đã xác nhận hôm nay” (`don-dat-stats.tsx:57-60`), nhưng contract/backend xác định `totalTicketAmount` và `bookedTickets` là tổng vé CONFIRMED trong đơn CONFIRMED **trên toàn bộ thời gian**, không phải riêng hôm nay (`ViVuViet-backend/.../CompanyBookingStatisticsResponse.java:7-10`, contract `scripts/company-booking-api-contract.md:22-28`). Đổi phụ đề để tránh hiểu sai số liệu.

### P2 — Lỗi/tải bộ đếm tab bị hiển thị như số 0

Hook trả `countsLoading` nhưng board không truyền trạng thái này xuống toolbar (`use-don-dat-board.ts:104-105,155-165`; `don-dat-board.tsx:159-168`). Toolbar hiển thị `0` khi `counts` chưa có (`don-dat-toolbar.tsx:85-89`); API lỗi cũng không có trạng thái lỗi riêng, nên số đếm chưa tải/không tải được trông như dữ liệu thật bằng 0. Cần phân biệt loading/error với giá trị zero.

### P3 — Khả năng truy cập và phục hồi lỗi

- Các nút tab dùng `role="tab"` nhưng không có `aria-controls`/tabpanel hay xử lý phím mũi tên (`don-dat-toolbar.tsx:68-82`). Nên hoàn thiện pattern tab ARIA hoặc dùng nút lọc thông thường nếu không triển khai keyboard interaction.
- Drawer chi tiết có hiển thị lỗi nhưng không có nút thử lại; hook không trả `detailQuery.refetch` (`use-don-dat-board.ts:122-126,179-184`, `don-dat-detail-drawer.tsx:99-108`). Người dùng phải đóng/mở lại để retry.

## Thứ tự xử lý đề xuất

1. Sửa định dạng và biên ngày cho filter, đồng thời không cho chọn khoảng ngày đảo ngược.
2. Khóa/ẩn thao tác hủy khi chuyến không còn ở trạng thái trước khởi hành; đồng bộ theo luật backend.
3. Đưa `historyComplete` vào view-model và hiển thị cảnh báo; chỉ nới nullability của trạng thái hành khách nếu dữ liệu lưu cũ/schema cho phép null, khi đó thêm fallback.
4. Sửa phụ đề số liệu, biểu diễn loading/error bộ đếm và thêm retry cho chi tiết.
5. Hoàn thiện tab accessibility và xóa animation/selector CSS không dùng.
