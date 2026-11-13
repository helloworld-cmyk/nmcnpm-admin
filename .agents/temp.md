Đã rà soát toàn bộ màn `/xe` (route, components, utils, store, API, hooks) và đối chiếu với `design/admin/screens/admin-xe/`. Kết quả:

## 1. Còn dùng mock data không?
Không còn mảng mock data. Nhưng vẫn còn **dữ liệu giả chỉ sống trong phiên**:
- `_data/vehicles.ts` tuy nằm trong folder `_data/` (quy ước dành cho mock) nhưng thực chất **chỉ chứa type + hằng số + helper**, không có bản ghi mẫu → đặt tên/vị trí sai quy ước (AGENTS §7.1), không phải thừa.
- `map-vehicle.ts:31-35` gán cứng `taiXeId: null, taiXe: null, dangKiem: "", baoHiem: ""`, và `daGanChuyen: false` (dòng 36).
- `xe-board.tsx:104,165-167` dùng state `overrides` để "đắp" tài xế/hạn giấy tờ cục bộ. Refresh là mất sạch → đây thực chất là **chưa ghép API**.

## 2. Chỗ chưa ghép API
- **Tài xế phụ trách**: form cho chọn và lưu `taiXeId`, nhưng `handleSave` (`xe-board.tsx:184-210`) chỉ gửi `plateNumber/vehicleModel/passengerCapacity/status` lên BE; tài xế chỉ ghi vào `overrides` local.
- **Hạn đăng kiểm / hạn bảo hiểm**: nhập trong form (`xe-form-modal.tsx:252-268`) nhưng không gửi lên BE, chỉ lưu override.
- **`daGanChuyen`** luôn `false` → nút "Xóa" (`xe-table.tsx:234`) không bao giờ bị disable.
- **Lọc/tìm kiếm**: `list-vehicles.ts` có param `q`/`status` nhưng `xe-board.tsx:97` gọi `useVehicles(companyId)` không truyền → toàn bộ search/lọc/tình trạng/sắp xếp/phân trang đang làm **client-side** trên mảng đã tải hết.
- **Sơ đồ ghế**: có API + hook nhưng **không có UI nào dùng** (xem mục 5).

## 3. Thiếu API
- Không có endpoint gán/gỡ tài xế phụ trách cho xe.
- Không có endpoint/field cho hạn đăng kiểm & bảo hiểm.
- Không có nguồn dữ liệu "xe đã gắn chuyến" (để chặn xoá / chỉ cho ngưng sử dụng).
- `delete-vehicle.ts` là DELETE cứng; design (`xe-modals.html:113`) nói xe đã gắn chuyến chỉ được "ngưng sử dụng" — chưa có nhánh xử lý.

## 4. API thiếu trường
`VehicleResponse` (`api/xe/api/types.ts:7-17`) thiếu:
- `driverId` / `driverName` (tài xế phụ trách)
- `inspectionExpiresOn` (hạn đăng kiểm)
- `insuranceExpiresOn` (hạn bảo hiểm)
- cờ/đếm cho biết xe đã gắn chuyến (vd. `assignedTripCount`/`hasTrips`)

`CreateVehiclePayload` / `UpdateVehiclePayload` cũng thiếu các trường tương ứng nên form không thể lưu. Ngoài ra `seatLayoutId` có trong response nhưng không dùng ở UI.

## 5. File thừa / không dùng
Xác nhận bằng grep là **không nơi nào import**:
- `src/api/xe/tanstack/use-vehicle.ts` + `src/api/xe/api/get-vehicle.ts`
- `src/api/xe/tanstack/use-vehicle-seats.ts` + `src/api/xe/api/get-vehicle-seats.ts`
- `src/api/xe/tanstack/use-configure-vehicle-seats.ts` + `src/api/xe/api/configure-vehicle-seats.ts`
- Types seats trong `api/xe/api/types.ts:40-68` (`ConfigureVehicleSeatsPayload`, `VehicleSeatResponse`, `VehicleSeatLayoutResponse`) và `seatLayoutId` — không dùng.

Các file seats có thể là dự phòng cho tính năng sơ đồ ghế chưa làm, nhưng hiện tại không có consumer nào nên đang là dead code.

**Tóm lại ưu tiên xử lý**: (1) bổ sung field/endpoint tài xế + hạn giấy tờ để bỏ `overrides` local, (2) nguồn dữ liệu `daGanChuyen`, (3) dọn 6 file + 3 type seats không dùng (hoặc làm luôn UI sơ đồ ghế), (4) chuyển search/filter/paging sang param backend.