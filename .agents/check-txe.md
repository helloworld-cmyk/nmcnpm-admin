Đã rà soát toàn bộ route `src/app/(admin)/tai-xe`, lớp `src/api/tai-xe`, store filter, đối chiếu backend `ViVuViet-backend` và chạy thử local. `npx tsc --noEmit` và `npm run lint` đều pass. Kết luận: **không còn mock, API chính đã nối đủ**, nhưng có 1 lỗi nghiệp vụ đáng ưu tiên và vài gap API/UX.

## 1. Còn chỗ nào dùng mock data không?

**Không.** Route và API layer không còn mock:

- Không có `_data/` trong route, không `setTimeout`, `Math.random`, mảng tài xế mẫu.
- `GPLX_HANG_OPTIONS`, `TRANG_THAI_TAI_XE_OPTIONS`, `EMPTY_TAI_XE_FORM`, `TRIP_STATUS_LABEL` chỉ là enum/nhãn UI, không phải dữ liệu giả.
- Runtime xác nhận dữ liệu thật:
  - `GET /bus-companies/{id}/drivers?page=0&size=8`
  - `GET /bus-companies/{id}/drivers/{driverId}`
  - `GET /bus-companies/{id}/drivers/{driverId}/trips?page=0&size=5`
  - `PATCH /bus-companies/{id}/drivers/{driverId}`

## 2. Còn chỗ nào chưa ghép API không?

Các luồng chính đã nối đủ: list, search, lọc trạng thái, phân trang, detail, chuyến gần đây, tạo, sửa, khóa/mở khóa, reset mật khẩu.

Tuy nhiên **P1 — form sửa chưa dùng đúng PATCH partial-update** đã được **sửa**:

- `UpdateDriverPayload` cho phép gửi từng field (`src/api/tai-xe/api/types.ts:58`).
- Form sửa giờ chỉ validate và gửi **các field thực sự thay đổi** so với `initial`:
  - `validateTaiXeForm` nhận `options` (`mode: "add" | "edit"`, `initial`) — edit chỉ check field thay đổi (`tai-xe-form.ts:94`).
  - `useTaiXeForm` so sánh state hiện tại với `initial` và chỉ validate các field khác biệt (`use-tai-xe-form.ts:72`).
  - `handleSave` gửi `UpdateDriverPayload` partial (chỉ key có giá trị) cho edit, đủ field cho create (`use-tai-xe-board.ts:130`).
  - `validateTaiXeForm` trả về `TaiXeFormPatchValues` (Partial) khi edit, `TaiXeFormValues` đầy đủ khi tạo.
- Hệ quả:
  - Tài xế đã hết hạn GPLX giờ **sửa được** chỉ tên/SĐT/email — form không chặn ở các field không đụng đến.
  - Tài xế legacy thiếu hồ sơ GPLX cũng sửa được tương tự.
  - Nếu người dùng sửa GPLX, validate vẫn áp dụng đầy đủ (12 chữ số, hạng hợp lệ, hạn tương lai do BE `@Future`).

## 3. Còn chỗ nào thiếu API không?

**Không thiếu endpoint bắt buộc cho phạm vi UI hiện tại.** Các endpoint list/detail/trips/create/update/status/reset đều có.

Các gap API thực tế:

- **Search chưa hỗ trợ tiếng Việt không dấu.** Backend chỉ `lower(...)`, không bỏ dấu. Test trực tiếp:
  - `search=ha` → 0 kết quả
  - `search=Hà` → 1 kết quả
  - `search=dung` → 0
  - `search=DUy` → 1
  Đây là lỗi UX lớn với admin Việt Nam; nên bổ sung unaccent ở BE hoặc chuẩn hóa tìm kiếm.
- **List drivers không có `sort`**. Hiện UI chưa cần, nhưng nếu muốn sort theo tên/trạng thái/số chuyến thì API phải mở rộng.
- **Thiếu dữ liệu để biết tài xế có mở khóa được hay không** (xem mục 4).
- **N+1 ở màn `/chuyen`** (liên quan `tai-xe` API): `use-driver-trip-statuses.ts` gọi `GET /drivers/{id}/trips?size=100` cho **từng tài xế**. File này không thừa vì `/chuyen` đang dùng, nhưng nên có endpoint batch hoặc trả `assignmentStatus` ngay trong list trips.
- Không có API quản lý giấy tờ/avatar/thông báo cấp tài khoản — nhưng thiết kế hiện tại cũng không yêu cầu.

## 4. Các API có trường nào bị thiếu không?

Đối chiếu DTO backend, type FE **khớp 1-1** cho list/get/trips/credential/create/update/status/reset. Không thiếu field để render màn hiện tại.

Tuy nhiên có 2 vấn đề contract:

### 4.1. `phone` có thể null nhưng FE khai báo non-null

- FE: `CompanyDriverResponse.phone: string` (`src/api/tai-xe/api/types.ts:28`)
- BE: `UserAccount.phone` là `String` nullable; chính service reset mật khẩu có check “Driver must have a phone number for login”.
- FE map thẳng: `soDienThoai: driver.phone` (`map-driver.ts:10`)
- Form sửa nhận raw value; `digitsOnly(state.phone)` gọi `.replace` (`tai-xe-form.ts:65`)

Nếu BE trả `phone = null`, việc mở form sửa có thể **crash tại validate** hoặc hiển thị ô trống. Nên đổi type thành `string | null` và fallback `""` khi map.

### 4.2. `status` chỉ là trạng thái tổng hợp, thiếu lý do khóa

BE trả `status: ACTIVE | LOCKED` nhưng thực tế trạng thái được suy ra từ 3 nguồn: membership, user account và driver profile. Khi mở khóa, BE yêu cầu membership + account phải ACTIVE, nếu không trả 409.

FE chỉ có `status` tổng hợp nên vẫn hiện nút “Mở khóa” cho trường hợp chắc chắn thất bại, và không giải thích được lý do. Nên bổ sung một trong:

- `accountStatus`, `membershipStatus`, `profileStatus`, hoặc
- `canUnlock: boolean` + `lockReason`.

### 4.3. Field BE trả nhưng màn này chưa dùng

- `CompanyDriverResponse`: `profileId`, `updatedAt`
- `CompanyDriverTripResponse`: `expectedArrivalAt`, `assignmentStatus`, `assignedAt`

Đây không phải lỗi contract, chỉ là dữ liệu chưa được khai thác. `assignmentStatus` đặc biệt hữu ích nếu muốn hiển thị tài xế đã nhận lệnh hay chưa.

## 5. File/code nào thừa, không dùng đến?

**Không có file nào bị bỏ hoàn toàn.** Tất cả component, hook, store, utils của route đều có nơi dùng.

Các điểm dead code nhỏ:

- `export type { TaiXeConfirmMode }` trong `tai-xe-confirm-modal.tsx:8` — không ai import.
- Class `tx-toolbar` (`tai-xe-filters.tsx:28`) và `tx-form-grid` (`tai-xe-form-body.tsx:17`) **không được định nghĩa ở CSS nào**; vô hại nhưng nên xóa.
- `digitsOnly` được export (`tai-xe-form.ts:65`) nhưng chỉ dùng nội bộ file.
- `EMPTY_INVALID` bị lặp ở `tai-xe-form.ts:53` và `use-tai-xe-form.ts:28`; nên export dùng chung.
- Optimistic update khi khóa/mở khóa từ modal chi tiết gần như vô tác dụng:
  - `setDetail` patch ở `use-tai-xe-board.ts:192`
  - nhưng `activeDetail = detailTaiXe ?? detail` (`tai-xe-board.tsx:56`) luôn ưu tiên dữ liệu cũ từ `detailQuery` cho đến khi refetch xong.

**Không được xóa nhầm:**

- `get-driver.ts` + `use-driver.ts`: đang được chính màn này dùng.
- `use-driver-trip-statuses.ts`: không dùng ở `/tai-xe` nhưng `/chuyen` dùng (`use-chuyen-board.ts:21,184`).
- `tai-xe.css`: cả `.btn-accent`, `.tx-dot`, `.tx-actions` đều đang dùng.

## 6. Các vấn đề khác

**P1 — lỗi sửa tài xế hết hạn GPLX/legacy** đã được **sửa** (xem mục 2).

**P2 — lỗi backend hiển thị nguyên tiếng Anh, thiếu validate độ dài ở client:**

- `apiMessage` trả thẳng `ApiError.message` (`use-tai-xe-board.ts:27`).
- Backend trả các message tiếng Anh như:
  - `size must be between 3 and 160`
  - `Phone number is already registered`
  - `License number is already registered for this company`
  - `The account and company membership must be active before unlocking this driver`
- Đã test thực tế: nhập họ tên 200 ký tự → form gửi PATCH → BE trả 400 → toast hiện đúng chuỗi `size must be between 3 and 160`.
- FE chưa chặn các giới hạn backend:
  - `fullName` max 160
  - `email` max 254
  - `note` max 500
  - `search` max 200
- Nên thêm `maxLength` + validate ở client, đồng thời map message lỗi BE sang tiếng Việt hoặc yêu cầu BE trả message tiếng Việt.

**P2 — tìm kiếm không dấu không hoạt động** đã nêu ở mục 3.

**P2 — empty state gộp hai trường hợp:** `TaiXeEmptyState` luôn hiện “Không có tài xế phù hợp” kể cả khi hãng chưa có tài xế nào và không có filter (`tai-xe-empty-state.tsx:17`, `tai-xe-board.tsx:87`). Nên phân biệt “chưa có dữ liệu” và “không khớp bộ lọc”.

**P2 — tạo tài xế xong có thể không thấy tài xế mới:** `handleSave` chỉ `setPage(1)`, không reset `search`/`trangThai` (`use-tai-xe-board.ts:148`). Nếu admin đang lọc “Bị khóa” hoặc đang tìm tên khác, tài xế mới tạo sẽ không xuất hiện dù toast báo thành công. Nên reset filter hoặc thông báo rõ.

**P3 — UI chưa khớp thiết kế:**

- SĐT đang hiển thị raw, ví dụ `0111111112` (`tai-xe-table.tsx:108`, `tai-xe-detail-modal.tsx:112`), trong khi design format `0912 345 001`. Nên thêm `formatPhone` chỉ dùng khi hiển thị, giữ raw trong form.
- Bảng và modal chi tiết không có avatar chữ cái đầu như design (`tai-xe-table.tsx:100`, `tai-xe-detail-modal.tsx:90`). Thuần UI, không phải lỗi API.

**P3 — lỗi detail query không được báo:** `useDriver` lỗi thì modal vẫn hiện dữ liệu cũ từ row, không có cảnh báo (`use-tai-xe-board.ts:94`, `tai-xe-board.tsx:143`). Với thao tác sửa/khóa sau đó, admin có thể thao tác trên dữ liệu cũ.

**P3 — filter state tồn tại qua logout:** `tai-xe-filters-store` là module-level store, logout chỉ clear company/session (`session-store.ts:112`), không reset search/status/page. Nếu cùng tab đăng nhập tài khoản khác, bộ lọc của admin trước vẫn còn.

**P3 — row click chưa hỗ trợ bàn phím:** `<tr onClick>` không có `tabIndex`/`role`/`onKeyDown` (`tai-xe-table.tsx:99`). Vẫn có nút “Chi tiết” nên không phải blocker.

**P3 — chưa có debounce tìm kiếm:** chỉ dùng `useDeferredValue` (`use-tai-xe-board.ts:46`), gõ chậm có thể bắn request theo từng ký tự. Nên debounce ~250–300ms.

## Ưu tiên sửa

1. ~~Sửa form edit: partial PATCH + cho phép giữ nguyên GPLX hết hạn/legacy.~~ **ĐÃ SỬA** (xem mục 2).
2. Thêm validate độ dài client + map lỗi backend sang tiếng Việt.
3. Sửa search không dấu (BE unaccent hoặc phương án FE phù hợp).
4. Bổ sung field trạng thái chi tiết/`canUnlock` để xử lý mở khóa đúng.
5. Dọn dead code nhỏ và xử lý các UX: empty state, reset filter sau tạo, format SĐT/avatar.
6. Thêm test cho `validateTaiXeForm` (GPLX hết hạn/legacy) và `mapDriver` (phone null) — hiện repo chưa có test cho route này.