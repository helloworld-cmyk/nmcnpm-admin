Đã kiểm tra cả code và chạy thật trên `http://localhost:3000/chuyen` (backend local, 6 chuyến). Dưới đây là các vấn đề theo đúng 6 mục.

## 1. Còn dùng mock/local data

- `src/app/(admin)/chuyen/_utils/map-trip.ts:77-96`: `taixe`, `xeBienSo`, `xeLoai`, `sucChua`, `daDat`, `lenh` khởi tạo `null/0`; `tre`, `suco` không có nguồn nào set → badge “Trễ” và “Sự cố” trên bảng không bao giờ hiển thị.
- `src/app/(admin)/chuyen/_hooks/use-chuyen-board.ts:697-741`: `handleSucoNhan` / `handleSucoKetQua` chỉ `setOverride` cục bộ, toast “backend chưa hỗ trợ”. Toàn bộ luồng sự cố là giả lập.
- `src/app/(admin)/chuyen/_utils/chuyen-detail.ts:154-183`: timeline tự dựng, luôn thêm mốc “Đã công bố bán vé” = `done` cho mọi chuyến (kể cả DRAFT chưa publish), không dùng `history` thật từ API.
- `src/app/(admin)/chuyen/_data/chuyen.ts:307-320`: `gioHienTai`, `mocThoiGianHienTai` không nơi nào dùng.
- `src/app/(admin)/chuyen/_components/chuyen-suco-xu-ly-modal.tsx:32,150-159`: state `ghiChu` nhập vào nhưng không truyền đi đâu.
- `src/app/(admin)/chuyen/_components/chuyen.css:150-178`: `@keyframes cd-drawer-out`, `cd-fade-out` không được dùng.

## 2. Chưa ghép API

- Drawer chi tiết (`use-chuyen-detail.ts:22-30`) đang gọi 3 API `/bookings`, `/assignments`, `/vehicles/{id}` để ghép lại, trong khi `GET /bus-companies/{id}/trips/{tripId}` đã trả đủ `seats`, `assignment` (biển số/model/sức chứa/status), `passengers`, `history`, `actions`. Endpoint này có sẵn nhưng không dùng.
- `map-trip.ts:199`: `daThu = ticket.status === "CONFIRMED"` là sai nghiệp vụ. Phải dùng `ticket.paymentCollected`. Live: ticket `paymentCollected: null` nhưng drawer vẫn hiện “Đã thu”.
- `bookingCutoffAt` có trong API (`types.ts:44`) nhưng FE không đọc, form cũng không có field này.
- `salesStatus` chỉ dùng cho `laChuyenNhap`; `PAUSED` không hiển thị ở đâu.
- `TripDetailResponse.actions` (canEdit/canAssign/canPublish/canCancel) bị bỏ, FE tự tính lại bằng `coTheSua/coThePhanCong...` → dễ lệch với backend.
- Lọc/sort/phân trang đang làm ở client (`use-chuyen-board.ts:275-325`) dù `ListTripsQuery` hỗ trợ `date/status/routeId/assignmentStatus` (`types.ts:73-78`).
- `taoMaChuyen` tự sinh mã chuyến ở client (`use-chuyen-board.ts:575`) → dễ trùng khi 2 admin tạo cùng lúc.
- `refetch` chỉ gọi `tripsQuery.refetch()` và `tabSource.refetch()`, không refetch assignments/bookings (`use-chuyen-board.ts:777-780`).

## 3. Thiếu API

- `GET /trips` không trả xe/tài xế/phân công/số ghế đã đặt/occupancy → buộc FE gọi N+1.
- Không có bulk endpoint cho assignments / số ghế đã đặt / trạng thái nhận lệnh của nhiều tài xế.
- Sự cố: mới có `GET /dashboard/open-incidents` cho màn Tổng quan; không có API sự cố theo từng chuyến, không có API “nhận xử lý” / “ghi nhận kết quả”.
- Không có `lateMinutes` cho danh sách chuyến (chỉ `dashboard/today-trips` có).
- Không có endpoint bỏ phân công (unassign) — `AssignTripPayload` bắt buộc cả `vehicleId` và `driverId`.

## 4. API thiếu trường

- `TripResponse` (`src/api/chuyen/api/types.ts:28-53`) thiếu: `vehicleId/vehiclePlate/vehicleModel/passengerCapacity`, `driverId/driverName/driverPhone`, `assignmentStatus`, `bookedSeats/availableSeats/occupancyRate`, `lateMinutes`, `openIncidentCount`.
- `TripAssignmentResponse` (`types.ts:81-88`) thiếu `assignmentStatus`, `plateNumber`, `vehicleModel`, `passengerCapacity` — các trường này chỉ có ở `TripDetailAssignment` trong endpoint chi tiết.
- `TripPassengerBookingResponse.passengers[]` (`types.ts:103-112`) thiếu `bookingCode`, `contactName`, `contactPhone` ở cấp passenger; hiện phải workaround bằng `booking.contactPhone`.
- `TicketResponse.paymentCollected` đã có nhưng FE không đọc.
- `TripDetailResponse` (`types.ts:173-185`) đã đủ dữ liệu nhưng không được sử dụng.

## 5. File/code thừa

- `src/api/chuyen/api/get-trip.ts` — không nơi nào import.
- `src/api/chuyen/tanstack/use-trip.ts` — không nơi nào import.
- `src/api/chuyen/api/types.ts`: `TripDetailResponse`, `TripSeatSummary`, `TripDetailAssignment`, `TripDetailPassenger`, `TripDetailHistoryItem`, `TripDetailActions` (chỉ phục vụ 2 file trên).
- `src/app/(admin)/chuyen/_components/chuyen-suco-xu-ly-modal.tsx` và `chuyen-suco-ket-qua-modal.tsx` — chỉ render khi `trip.suco` tồn tại, mà `trip.suco` không bao giờ được set từ API.
- `_data/chuyen.ts`: `SuCo`, `SucoTrangThai`, `NGUOI_XU_LY_OPTIONS`, `BIEN_PHAP_OPTIONS`, `bienPhapLabel`, `gioHienTai`, `mocThoiGianHienTai`; các field `soChoMo`, `ghiChu`, `tre`, `suco`.
- `_utils/chuyen-detail.ts`: `SUCO_STATE`.
- `_components/chuyen.css`: `@keyframes cd-drawer-out`, `cd-fade-out`.
- `_components/chuyen-table.tsx:64-70`: `seatBarVariant` cục bộ trùng với `_utils/chuyen-detail.ts:114`.
- `_hooks/use-chuyen-board.ts`: `sucoState`, `sucoTrip`, `openSuco`, `closeSuco`, `handleSucoNhan`, `handleSucoKetQua`.
- `_components/chuyen-detail-drawer.tsx`: cả section “Xử lý sự cố” + `treText`.
- `_hooks/use-chuyen-detail-drawer.ts`: `sucoState`, `treText`.
- `_components/chuyen-table.tsx`: badge sự cố + `trip.tre`.
- `_components/chuyen-suco-xu-ly-modal.tsx`: state `ghiChu`.

## 6. Vấn đề khác

- **N+1 nghiêm trọng**: với 6 chuyến, màn gọi 15 request: 1 `/trips` + 1 `/routes` + 1 `/vehicles` + 1 `/drivers` + 6 `/assignments` + 4 `/bookings` + 1 `/drivers/{id}/trips`. Với 100 chuyến sẽ là hơn 100 request.
- **Chuyến đã hủy vẫn chiếm tài nguyên**: `_utils/chuyen-form.ts:26-42` không lọc `CANCELLED/TERMINATED`. Live: chuyến VC-1002 đã hủy hôm nay vẫn làm xe 29A123.45 báo “Bận 18:00–20:10”, form chặn chọn xe/tài xế theo lịch ảo.
- **Route không lọc trạng thái**: `use-chuyen-board.ts:98-105` lấy toàn bộ `/routes`, không lọc `status === "ACTIVE"` → route INACTIVE vẫn chọn được, dù placeholder ghi “tuyến đang hoạt động”.
- **Filter Tuyến thiếu “Tất cả”**: `chuyen-toolbar.tsx:130-142` chỉ map `tuyenOptions`, không có option `all`; giá trị mặc định `all` không tồn tại trong list nên UI hiện “— Chọn —” và không thể clear về “tất cả”.
- **Hiển thị UUID thay vì biển số**: `chuyen-form-body.tsx:228-238` truyền `name={values.xe}` (id) vào `AvailRow`. Live: “Tình trạng tài nguyên” hiện `59091217-47ee-47b8-92bb-dd685dfd6304`.
- **Double submit**: form không disable nút khi mutation đang chạy (`chuyen-form-body.tsx:259-276`); `useChuyenBoard` không truyền `isPending` xuống form → bấm nhanh 2 lần có thể tạo 2 chuyến.
- **Toast sai type**: tạo được chuyến nhưng assign thất bại vẫn báo `success` (`use-chuyen-board.ts:614-616`).
- **`overrides` không bao giờ clear** (`use-chuyen-board.ts:77-79,336-341`) → sau refetch, dữ liệu cũ vẫn che dữ liệu server.
- **Nút chết**: bảng “Đang thực hiện” render 2 nút disabled không có handler (`chuyen-table.tsx:357-378`).
- **Lịch chốt ngày ở module scope**: `use-chuyen-lich.ts:21` dùng `homNayISO()` khi import → qua nửa đêm vẫn coi là “hôm nay” cũ.
- **TERMINATED bị gộp “Đã hủy”**: `map-trip.ts:19-26` map `TERMINATED` → `da-huy`; không phân biệt “đã hủy” và “kết thúc/chấm dứt”.
- **Dev-only console error Next 16**: `/chuyen` thỉnh thoảng báo “Could not validate that a segment in your UI has instant navigation” khi re-render; reload full thì hết. Không phải lỗi production nhưng nên kiểm tra `export const instant = false` hoặc làm page `async` như `/xe`.