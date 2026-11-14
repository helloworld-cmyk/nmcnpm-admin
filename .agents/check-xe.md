Đã rà soát toàn bộ route `src/app/(admin)/xe`, `src/api/xe`, store filter, đối chiếu backend `ViVuViet-backend` và chạy thử local. `npx tsc --noEmit` và `npm run lint` đều pass (kiểm tra lại sau đợt sửa 2026-11-14), nên các vấn đề dưới đây là lỗi logic/hợp đồng API, không phải lỗi type.

## Trạng thái sau đợt sửa 2026-11-14

**Đợt 1 — gỡ facade “tài xế phụ trách” (đã xong):**

1. Bỏ request `/drivers` thừa: `useDrivers` + `driverOptions` + `driverNameById` đã bị xóa khỏi `use-xe-board.ts`. Không còn `GET /bus-companies/{id}/drivers?status=ACTIVE&size=100` khi vào `/xe`.
2. Bỏ state `overrides` cục bộ và các field `taiXeId`/`taiXe` trong view-model, form, cột bảng, sort key, filter.
3. Chặn mất dữ liệu sơ đồ ghế (chỉ bật `ready` sau khi GET seats thành công) và giấy tờ (chỉ bật `ready` sau khi GET documents thành công; payload PUT gửi đủ 5 field).

**Đợt 2 — dọn dữ liệu giả còn lại (đã xong):**

4. **Gỡ `daGanChuyen`**: xóa field khỏi `Xe` (`_data/vehicles.ts`), khỏi `mapVehicle` (`_utils/map-vehicle.ts:32`), và xóa nhánh `disabled`/`title` của nút Xóa (`xe-table.tsx`). Không còn code chết.
5. **Gỡ `XE_SO_CHO_OPTIONS` hardcode**: thêm `collectSoChoOptions(vehicles, selected)` (`_utils/xe-list.ts`) sinh danh sách mức sức chứa từ chính dữ liệu xe của hãng; `useXeBoard` trả `soChoOptions`, `XeBoard` truyền xuống `XeFilters`. Hết cảnh xe 15/29/45 chỗ không lọc được.
6. **Copy/hành vi xóa xe đúng thực tế backend**: modal xóa (`xe-delete-modal.tsx`) và toast (`use-xe-board.ts`) nói rõ “xóa khỏi đội xe, hoặc chuyển **Ngưng sử dụng** nếu xe đã có phân công chuyến”, khớp `VehicleServiceImpl.deleteVehicle` (xóa cứng khi chưa có assignment, ngược lại set `RETIRED`).
7. **Copy bảng + metadata đúng thực tế**: bỏ câu “Tình trạng xe cập nhật sau mỗi chuyến hoàn thành” (backend chỉ đổi qua form/PATCH); metadata `/xe` bỏ “tài xế phụ trách” và “hạn giấy tờ” (bảng không hiển thị các field này).

Các vấn đề còn lại bên dưới là **chưa xử lý**.

---

## Kết luận ngắn

CRUD xe, sơ đồ ghế và giấy tờ **đã nối API thật**, không còn mock/facade và không còn state đắp dữ liệu cục bộ. Còn tồn tại: lọc/tìm/sắp xếp/phân trang client-side, tạo xe + PATCH trạng thái không nguyên tử, thiếu cờ “xe đã có phân công chuyến”, PUT giấy tờ là full-replace (đã bù ở FE), và một số sai lệch dữ liệu/validate/UX.

---

## 1. Còn chỗ nào dùng mock data không?

**Không còn mảng mock tĩnh** kiểu danh sách xe mẫu, không còn field/constant hardcode kiểu `daGanChuyen`/`XE_SO_CHO_OPTIONS`. Còn dữ liệu mặc định:

- `seat-layout.ts` (`emptyEditorState`) hardcode sơ đồ gợi ý 5 hàng × 3 cột khi xe chưa cấu hình ghế — đây là giá trị khởi tạo cho trình cấu hình, backend trả `seats: []` thì FE phải tự dựng.
- `_data/vehicles.ts`, `_data/seats.ts`, `_data/documents.ts` thực chất chỉ chứa type/hằng số (không phải mock), nên đặt trong `_data/` sai quy ước AGENTS §7.1 (nên chuyển sang `_utils/` hoặc `_types/`).

Runtime xác nhận các request thật khi vào `/xe` và mở modal: `GET /vehicles`, `POST /vehicles`, `PATCH /vehicles/{id}`, `DELETE /vehicles/{id}`, `GET|PUT /vehicles/{id}/seats`, `GET|PUT /vehicles/{id}/documents`. **Không còn request `/drivers`.**

---

## 2. Chỗ nào chưa ghép API?

- **Tìm kiếm/lọc/sắp xếp/phân trang**: `use-xe-board.ts` gọi `useVehicles(companyId)` không truyền `q`/`status`, dù `list-vehicles.ts` và backend đã hỗ trợ. Toàn bộ đang lọc/sort/cắt trang ở client (`xe-list.ts`, `XE_PAGE_SIZE = 6`) → chỉ đúng với đội xe nhỏ.
- **Tạo xe với trạng thái**: `CreateVehicleRequest` không có `status`; FE phải POST tạo xe rồi PATCH trạng thái — không nguyên tử.
- **Giấy tờ**: backend là **full replace**, FE gửi đủ 5 field (rỗng → `null`) để không mất dữ liệu — đây là cách bù ở FE, không phải partial update thật.
- **Xóa xe**: FE không biết trước xe có phân công chuyến hay không (backend không trả cờ), nên chỉ mô tả được cả hai khả năng bằng copy.

Đã ghép đúng API: list/create/update/delete xe, get/put sơ đồ ghế, get/put giấy tờ.

---

## 3. Còn thiếu API nào?

- **Cờ xe đã có phân công chuyến** (`hasAssignments`/`assignedTripCount`) — để FE biết trước kết quả `DELETE` (xóa cứng hay chuyển `RETIRED`) và khóa “Sơ đồ ghế” cho xe `RETIRED` một cách nhất quán.
- **`status` trong API tạo xe** để tránh POST + PATCH 2 bước.
- **`rows`/`columns` trong `VehicleSeatLayoutResponse`** để FE không phải suy ra kích thước từ tọa độ ghế.
- **Phân trang/sort cho danh sách xe** (`page`, `size`, `sort`, `total`) — hiện chỉ trả full array, chỉ hỗ trợ `q`/`status`.
- **Partial update cho giấy tờ** (PATCH, hoặc BE giữ nguyên field `null` không gửi).
- **Biển số dạng gốc để hiển thị**: backend chỉ lưu `plate_normalized`, FE không khôi phục được dấu gạch (`29A-123.45` → `29A123.45`).
- (Tùy chọn) API danh mục `vehicleType` nếu muốn lọc theo loại xe thật, thay vì sức chứa.

> Không còn nhu cầu API gán tài xế cho xe: tính năng này đã bị gỡ khỏi UI vì backend không có nguồn dữ liệu.

---

## 4. API có trường nào bị thiếu/lệch không?

**Không thiếu các field cơ bản của xe.** Vấn đề nằm ở chỗ API có field nhưng UI bỏ qua, và một số field phục vụ UI thì BE chưa có:

| Hướng | Field/hợp đồng | Thực trạng |
|---|---|---|
| BE có, FE type có, UI bỏ | `inspectionExpiresOn`, `vehicleType`, `manufacturingYear`, `fuelType`, `color` | Không map vào `Xe`, không hiển thị/nhập ở đâu |
| BE có, dùng một phần | `seatLayoutId` | Chỉ dùng để khóa sức chứa (`xe-form-modal.tsx`) |
| BE có, không dùng | `companyId`, `createdAt`, `updatedAt`; `VehicleSeatResponse.id` | Dư |
| BE trả `null` nhưng type non-null | `VehicleSeatLayoutResponse.name`, `seatLayoutId` | Type sai, backend trả `null` khi xe chưa có sơ đồ |
| BE thiếu cho UI | `hasAssignments` | Không biết trước kết quả `DELETE` |
| BE thiếu cho form | `status` trong `CreateVehicleRequest` | Phải PATCH sau khi tạo |
| BE thiếu cho layout | `rows`, `columns` | FE suy ra từ ghế lớn nhất, mất hàng/cột trống cuối |
| BE thiếu cho list | `page/size/sort/total` | Client-side pagination |
| Hợp đồng PUT giấy tờ | Full replace | BE set `null` mọi field không gửi; FE đã gửi đủ field + `null` để bù |
| Dữ liệu gốc | Biển số raw | Chỉ có `plate_normalized` |

Thêm: `ListVehiclesQuery.q/status` đang bị bỏ phí (lọc ở client); `inspectionExpiresOn` có trong response nhưng FE không đọc.

---

## 5. File/code nào thừa, không có tác dụng?

**Không có file nào của riêng `/xe` bị bỏ hoàn toàn** — tất cả component/hook/utils đều được import. Dead code còn lại:

- `xe-form-body.tsx` (`xe-form-grid`) và `xe-filters.tsx` (`xe-toolbar`): class không được định nghĩa ở CSS nào, không có tác dụng.
- `types.ts`: `VehicleSeatResponse.id` không dùng.
- `_data/vehicles.ts`, `_data/seats.ts`, `_data/documents.ts`: chỉ chứa type/hằng số, đặt sai chỗ theo AGENTS §7.1.

Lưu ý: `src/api/xe/api/get-vehicle.ts` + `tanstack/use-vehicle.ts` **không thừa** — đang được `/chuyen` dùng ở `use-chuyen-detail.ts`. Các API/hook seats đã được dùng thật trong `use-xe-seat-form.ts`.

---

## 6. Các vấn đề khác, theo mức độ

### Đã sửa (P0/P1)

1. **Lưu sơ đồ ghế khi GET đang tải/lỗi → ghi đè sơ đồ thật bằng mặc định.**
   - `use-xe-seat-form.ts`: thêm state `ready`, chỉ set `true` sau khi seed thành công; `submit` chặn nếu `!ready`.
   - `xe-seat-body.tsx` disable toàn bộ input/palette/ô ghế khi `!ready`, khóa nút lưu, GET lỗi hiện nút “Thử lại”.
2. **PUT giấy tờ ghi đè `null` các trường không gửi.**
   - `use-xe-document-form.ts`: thêm `ready`, `submit` chặn nếu `!ready`.
   - Payload gửi đủ 5 field, field rỗng gửi `null`; `xe-document-body.tsx` chỉ render form khi `ready`.
3. **Facade “tài xế phụ trách” + request `/drivers` thừa** — gỡ hoàn toàn (đợt 1).
4. **`daGanChuyen` giả + nhánh disable xóa chết** — gỡ hoàn toàn (đợt 2).
5. **`XE_SO_CHO_OPTIONS` hardcode** — thay bằng `collectSoChoOptions` lấy từ dữ liệu thật; nhãn filter sửa thành “Sức chứa” (đợt 2).
6. **Copy xóa xe / toast / subtitle bảng / metadata trang** — sửa đúng hành vi backend (đợt 2).

### P1 — Sai nghiệp vụ / UX nghiêm trọng

7. **Tạo xe + PATCH trạng thái không nguyên tử**: nếu PATCH lỗi, xe đã được tạo ở `ACTIVE`, danh sách không invalidate, modal vẫn mở; bấm lưu lại sẽ POST lần nữa → 409.
8. **Double submit**: `use-xe-form.ts` gọi `onSave` mà không await/không có pending, `xe-form-modal.tsx`/`xe-form-body.tsx` không disable nút khi đang lưu; `xe-delete-modal.tsx` không disable khi đang xóa. (Form ghế/giấy tờ đã có `saving` guard.)
9. **Kết quả `DELETE` không phản ánh đúng**: BE có thể chuyển `RETIRED` thay vì xóa; FE chỉ báo chung chung, không cho biết xe đã chuyển trạng thái (cần cờ `hasAssignments` từ BE).

### P2 — Dữ liệu/lọc/hiển thị

10. **Biển số bị chuẩn hóa mất dấu gạch**: backend trả `29A123.45`, placeholder lại là `29A-123.45`; search gõ có gạch sẽ không khớp. Check trùng biển số ở FE chỉ bỏ khoảng trắng, không bỏ `-` → FE cho qua nhưng BE trả 409.
11. **Filter sức chứa vẫn là proxy**: giờ đã lấy từ dữ liệu thật và đặt đúng nhãn, nhưng vẫn so khớp theo `passengerCapacity`, không lọc theo `vehicleType` (API có nhưng UI không dùng).
12. **Tìm kiếm không tìm theo mẫu xe**: `xe-list.ts` chỉ ghép biển số, dù backend `q` tìm cả `vehicle_model`.
13. **Sơ đồ ghế không round-trip đúng**:
    - suy ra rows/cols từ tọa độ lớn nhất → mất hàng/cột cuối toàn ô trống;
    - `seatLayoutFromResponse` bỏ `seatCode` gốc, `toSeatPayload` sinh lại `A01/B01...` → sơ đồ có mã ghế tùy chỉnh sẽ bị đổi mã khi lưu;
    - FE giới hạn 20 hàng × 5 cột, backend không giới hạn rows/cols (chỉ giới hạn 100 ghế).
14. **Thống kê sai khi có xe `RETIRED`**: `computeXeStats` tính `total` gồm cả ngưng sử dụng nhưng chỉ có 3 thẻ Tổng/Hoạt động/Bảo trì → tổng không bằng tổng các thẻ.
15. **Empty state sai ngữ cảnh**: khi hãng chưa có xe nào vẫn hiện “Không có xe nào khớp bộ lọc” + nút “Xóa lọc”, không có CTA “Thêm xe”.
16. **Validate chưa khớp backend**: thiếu `maxLength` biển số 20 / mẫu xe 120 / giấy tờ 120-255; sức chứa form max 50 trong khi sơ đồ ghế cho tối đa 100.

### P3 — Nhỏ / a11y

17. Tab giấy tờ dùng `role="tab"` nhưng thiếu `aria-controls`/`tabpanel`.
18. Badge giấy tờ luôn dùng icon `i-check-circle` kể cả khi `EXPIRED`.
19. Lỗi backend trả tiếng Anh (“Vehicle plate already exists...”) hiện thẳng lên toast.
20. Filter/store không reset khi đổi hãng.

---

## Thứ tự xử lý đề xuất

1. **P1**: xử lý tạo xe + trạng thái nguyên tử (thêm `status` vào API tạo, hoặc rollback khi PATCH lỗi).
2. **P1**: thêm pending/disable cho form xe và modal xóa; hiển thị rõ khi `DELETE` chuyển sang `RETIRED`.
3. **P2**: chuyển search/filter sang API (`q`/`status`), lọc theo `vehicleType` nếu BE có danh mục, chuẩn hóa biển số, bổ sung thẻ “Ngưng sử dụng”.
4. **P2**: sửa round-trip sơ đồ ghế (rows/cols, giữ seatCode), thống kê `RETIRED`, empty state, validate độ dài.
5. **P3**: dọn dead code còn lại (`xe-form-grid`/`xe-toolbar`, `VehicleSeatResponse.id`), sửa type nullable của seat layout, chuyển `_data/` sang `_utils/`, hoàn thiện a11y.