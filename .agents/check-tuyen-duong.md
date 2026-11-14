Đã rà soát toàn bộ route `src/app/(admin)/tuyen-duong` (page, 8 component, 2 hook, 2 util, `_data`, CSS), lớp API `src/api/tuyen-duong/**`, `src/api/area/**`, store `tuyen-duong-filters-store.ts`, và đối chiếu backend `ViVuViet-backend` (`RouteController`, `RouteServiceImpl`, `CreateRouteRequest`/`UpdateRouteRequest`, `RouteResponse`, `AreaController`). Đã chạy `npx tsc --noEmit` và `npm run lint` — cả hai **pass** (không lỗi, không warning), nên mọi vấn đề dưới đây là lỗi logic/hợp đồng/UX, không phải lỗi type. Không chạy app để test live.

## Kết luận ngắn

CRUD tuyến (list/create/update/PATCH trạng thái) **đã nối API thật**, không còn mảng mock, và `tripCount` lấy trực tiếp từ `RouteResponse.tripCount` (backend đếm thật) — không còn phần “số chuyến” bịa như các màn khác. Điểm yếu chính: **lọc/tìm/phân trang làm ở client**, **toàn bộ form phụ thuộc `GET /areas` tải hết danh mục** (dễ vỡ khi đổi/cần chọn khu vực lớn, không giới hạn), **`name` tuyến gửi lên là suy diễn ở FE** thay vì backend tự sinh (lệch dữ liệu đã biết), **thiếu error boundary cho form** và **thiếu pending cho nút bật/tắt trên bảng**. Ngoài ra có dead code thực sự (`get-route`/`useRoute`, class CSS không tồn tại) và vài lỗi UX/a11y nhỏ.

Lưu ý trạng thái working tree: 4 file của route đang có thay đổi **staged** (`_data/tuyen-duong.ts`, `_utils/tuyen-duong-form.ts`, `_hooks/use-tuyen-duong-board.ts`, `_components/tuyen-duong-form-body.tsx`) — đợt sửa code gần nhất (chuẩn hóa `code` uppercase, `nextRouteCode` thông minh hơn). Báo cáo dưới đây phản ánh **code hiện tại trên đĩa** (đã gồm các thay đổi đó), không phải HEAD.

---

## 1. Còn chỗ nào dùng mock/static/derived data?

**Không còn mảng mock tĩnh** kiểu danh sách tuyến mẫu. Toàn bộ bảng lấy từ `GET /bus-companies/{id}/routes` và map qua `mapRoute` (`_utils/map-route.ts:14-27`). Còn dữ liệu tĩnh/suy diễn:

- **`nextRouteCode`** (`_data/tuyen-duong.ts:40-78`): mã tuyến gợi ý sinh **ở client** từ danh sách code hiện có (tìm prefix `TUY-`, tăng số). Chỉ là giá trị mặc định của ô nhập — không phải dữ liệu bảng, nhưng **không do backend cấp**, nên hai admin mở form cùng lúc có thể thấy cùng một mã gợi ý.
- **`name` tuyến suy diễn ở FE** (`use-tuyen-duong-board.ts:138-143`): FE tự ghép `routeLabel(điểm đi, điểm đến)` rồi gửi `name` lên `POST/PATCH`. Đây là dữ liệu dẫn xuất gửi đi, không phải giá trị người dùng nhập — xem mục 4 và mục 6 (P1) vì lệch với hướng backend.
- **`TUYEN_DUONG_STATUS_OPTIONS`** (`_data/tuyen-duong.ts:23-26`): nhãn tĩnh `active/paused`, có nhãn tiếng Việt — hợp lệ (ánh xạ `RouteStatus`), không phải mock.
- **`_data/tuyen-duong.ts` chứa cả type + formatter + logic** (`formatMoney`, `formatDuration`, `nextRouteCode`): theo AGENTS §7.1 đây không phải “mock data”, nhưng đặt trong `_data/` là **sai quy ước** (chỉ nên chứa mock/thumbnail); logic/formatter nên ở `_utils/`.
- **Không có state đắp cục bộ** kiểu override lên bảng: sau mỗi mutation đều `invalidateRoutes()` (xem mục 2). Điểm này sạch hơn `/chuyen`.

> Kết luận mục 1: **Không còn mock bảng.** Chỉ còn 2 dữ liệu “sinh ở client” đáng bàn là `nextRouteCode` và `name` tuyến.

---

## 2. Chỗ nào chưa ghép API / còn thiếu ghép?

Đã ghép đúng: list (`useRoutes`), create (`useCreateRoute`), update toàn phần + PATCH trạng thái (`useUpdateRoute`), danh mục khu vực (`useAreas`). Không có request thừa rõ ràng. Các điểm chưa/ghép lỏng:

- **Tìm kiếm/lọc/phân trang 100% client-side** (`use-tuyen-duong-board.ts:72-91`): `useRoutes(companyId)` **không truyền query**; `listRoutesAPI` (`api/list-routes.ts:6-8`) và backend `RouteController.getRoutes` cũng **không có tham số lọc/phân trang** (chỉ `company_id` trong path). Toàn bộ lọc theo `search`/`trangThai` và cắt trang (`PAGE_SIZE = 5`) chạy trên mảng đã tải hết → đúng với vài chục tuyến, sai/hiệu năng kém khi danh mục lớn.
- **`GET /areas` không giới hạn** (`use-areas.ts:18-23` gọi `getAreasAPI()` không tham số; backend `AreaRepository.findActiveAreas` trả **toàn bộ** area ACTIVE, không phân trang — `AreaRepository.java:22-54`). Form tuyến (`tuyen-duong-form-body.tsx:116-164`) đổ **toàn bộ** danh sách này vào 2 `Select` → khi danh mục tỉnh/huyện/phường lớn, dropdown cực dài, tải chậm, và **không có ô tìm kiếm trong Select** (component `Select` là listbox chọn, không phải combobox search). Đây là điểm nghẽn khả dụng thực sự.
- **`useAreas` còn được dùng ở route khác?** Chỉ `use-tuyen-duong-board.ts:46`. Nếu route khác cũng cần danh mục area, nên xem lại việc cache/`staleTime` (hiện không set, dùng mặc định react-query) — nhưng ngoài phạm vi route này.
- **Không hỗ trợ nạp area theo cấp/parent trong UI**: `GetAreasQuery` (`get-areas.ts:13-17`) có `parentId`/`type` nhưng form **không dùng** → hiển thị lẫn lộn tỉnh + huyện + phường trong một list.

---

## 3. Còn thiếu API nào?

- **List routes có phân trang/lọc/sort**: backend chỉ có `GET /bus-companies/{id}/routes` trả full array. Cần `page/size/sort` + `q`/`status` nếu muốn lọc thật (hiện FE lọc client).
- **Danh mục area theo cấp + tìm kiếm server-side**: `GET /areas` đã có `keyword/parentId/type` (backend hỗ trợ) nhưng FE chưa dùng; lý tưởng là một endpoint gợi ý/search area (typeahead) thay vì nạp toàn bộ.
- **`tripCount` có nhưng chỉ đếm “tổng mọi trạng thái”** (`RouteResponse.java:44-45`). Màn “Ngừng tuyến” (`tuyen-duong-confirm-modal.tsx:66-71`) hiển thị “Chuyến đã tạo = tripCount”, đúng nghĩa tổng, ổn — nhưng nếu muốn cảnh báo “còn chuyến đang hoạt động” thì thiếu cờ (activeTripCount). Không bắt buộc.
- **Không có API xóa tuyến** — và FE cũng **không có UI xóa** (`UseUpdateRoute` chỉ PATCH status), phù hợp: tuyến chỉ tạm dừng, không xóa. Không tính là thiếu.
- **Áreas trả `type` + `parentId`, nhưng response area không có cờ phân cấp chuẩn để nhóm**: UI không dùng `parentId`/`type` (`AreaResponse` được map chỉ `id`+`name` ở `use-tuyen-duong-board.ts:57-59` và `form-body.tsx:130-133`).

---

## 4. API có trường nào bị thiếu/lệch không?

Đối chiếu `RouteResponse` (BE dto/Response/Trip/RouteResponse.java) với type FE (`api/tuyen-duong/api/types.ts:7-26`): **các field cơ bản khớp** (id, companyId, code, name, originArea{Id,Code,Name}, destinationArea{…}, distanceKm, durationMinutes, baseFareAmount, tripCount, status, createdAt, updatedAt). Sai lệch/không dùng:

| Hướng | Field/hợp đồng | Thực trạng |
|---|---|---|
| BE có, FE type có, UI bỏ | `name`, `companyId`, `originAreaCode`, `destinationAreaCode`, `createdAt` | Không map vào `TuyenDuong` (`map-route.ts:14-27`), không hiển thị. `name` FE lại **tự ghép** khi lưu thay vì dùng BE — lệch dữ liệu |
| BE có, FE type khớp kiểu | `distanceKm` (`BigDecimal`) vs FE `number` | JSON serialize số → FE `number` ổn; nhưng `toTuyenDuongFormState` dùng `String(number)` (`tuyen-duong-form.ts:59-61`) → mất `760.5` thành `760.5` được, nhưng số có dạng `760.50` bị chuẩn hóa; lưu lại gửi `Number` → OK |
| BE `code` normalize uppercase server-side (`RouteServiceImpl.java:167-170`) | FE cũng uppercase (`tuyen-duong-form.ts:70`, `form-body.tsx:105`) | Khớp, nhưng **validate trùng code ở FE** chỉ `trim().toUpperCase()` (đã sửa) — ok; vẫn có race vì BE là nguồn chuẩn (xem P2) |
| BE `name` **bắt buộc** (`CreateRouteRequest.java:26-29` `@NotBlank`) nhưng `RouteServiceImpl.createRoute` gọi `request.getName().trim()` (`RouteServiceImpl.java:80`) | FE gửi `name` suy diễn | Nếu FE bỏ `name` (theo note `.agents/be-tuyen-duong-name-area.md`) → **NPE 500**; hiện FE vẫn gửi nên chạy được, nhưng dữ liệu `name` do FE định nghĩa thay vì BE |
| BE `updateRoute` có `name` optional | FE luôn gửi `name` ở cả create lẫn update (`use-tuyen-duong-board.ts:140-152`) | Khi sửa tuyến **mà không đổi điểm đi/đến**, FE vẫn ghi đè `name` bằng ghép 2 area → vô hại nếu 2 area đúng, nhưng là FE đang “chữa” dữ liệu lệch |
| Hợp đồng PATCH | `UpdateRouteRequest` cho phép partial (`RouteController.java:98-118`) | FE gửi **đủ toàn bộ field** khi “Lưu thay đổi” (`use-tuyen-duong-board.ts:144-152`), partial thật chỉ dùng cho PATCH `status` (`:109`) |
| JSON timestamp | `createdAt`/`updatedAt` là `LocalDateTime` (BE) | FE `formatUpdated` (`map-route.ts:5-11`) parse `new Date(value)` — nếu BE serialize không có timezone thì hiển thị theo timezone máy; hiện chỉ hiện `dd/MM/yyyy` nên rủi ro lệch ngày là nhỏ nhưng tồn tại khi chạy gần nửa đêm |

Thêm: **`tripCount` trong `listRoutesAPI` đã đúng** (backend `getRoutes` join đếm thật — `RouteServiceImpl.java:48-58`), không còn bịa.

---

## 5. File/code nào thừa, không có tác dụng?

Đã kiểm tra call site cho từng mục trước khi kết luận.

- **`src/api/tuyen-duong/api/get-route.ts` (`getRouteAPI`)** và **`src/api/tuyen-duong/tanstack/use-route.ts` (`useRoute`)**: **không có nơi nào import**. Grep `useRoute\b|getRouteAPI` chỉ thấy chính 2 file này (`grep src` ra duy nhất `api/tuyen-duong/api/get-route.ts:6` và `tanstack/use-route.ts:5,15,21,22`). Endpoint chi tiết route backend có (`RouteController.getRoute`) nhưng FE chưa dùng.
- **Class CSS không tồn tại**:
  - `td-form-grid` dùng ở `tuyen-duong-form-body.tsx:12` — không định nghĩa trong `globals.css` lẫn `tuyen-duong.css` (grep `td-form-grid` chỉ ra đúng 1 chỗ dùng). Không có tác dụng.
  - `td-toolbar` dùng ở `tuyen-duong-toolbar.tsx:26` — cũng không định nghĩa ở đâu (grep `td-toolbar` chỉ ra dòng dùng).
- **Field type `TuyenDuong` không/ít dùng**: không có field chết trong `TuyenDuong` (tất cả `id/code/from/to/km/min/price/active/trips/updated` đều render ở bảng/confirm modal). Không phải dead code.
- **`formatMoney`/`formatDuration`** dùng ở bảng + confirm modal — hợp lệ.
- **`nextRouteCode`** dùng ở `form-modal.tsx:70` — hợp lệ (không chết), chỉ là logic sinh mã ở client.
- **`_data/tuyen-duong.ts`** đặt sai chỗ theo AGENTS §7.1 (chứa type + formatter + logic, không phải mock) — cùng loại với ghi nhận ở `/xe`.
- **`EMPTY_INVALID` bị khai báo trùng** ở `use-tuyen-duong-form.ts:27-34` (tên `EMPTY_INVALID`) và `tuyen-duong-form.ts:41-48` (cùng tên `EMPTY_INVALID`, nhưng export khác `EMPTY_TUYEN_DUONG_FORM`) → trùng lặp hằng, không phải bug nhưng thừa.
- **`routeLabelWithStation`** (`src/utils/route-label.ts:14-22`) **không** liên quan route này, dùng ở `/tong-quan` — **không** tính là dead của tuyen-duong.

> Ghi chú import chéo đã kiểm: route `/chuyen` import `useRoutes` + `RouteResponse` từ `src/api/tuyen-duong` (`use-chuyen-board.ts:23,26`) → khi sửa kiểu `RouteResponse` phải rà `/chuyen`.

---

## 6. Các vấn đề khác, theo mức độ

### P1 — Sai nghiệp vụ / UX nghiêm trọng

1. **Lỗi khi lưu form không được bắt ở tầng board → modal có thể treo ở trạng thái lỗi mơ hồ + không đóng đúng cách.** `handleFormSave` (`use-tuyen-duong-board.ts:138-173`) **không try/catch**: mutation reject → `onSave` reject → `useTuyenDuongForm.handleSubmit` bắt và `setStatus(errorMessage)` (`use-tuyen-duong-form.ts:99-104`) là ổn cho hiển thị, **nhưng** nếu `updateRoute/createRoute` reject **sau khi** toast success đã set (không xảy ra) hoặc khi `invalidateRoutes()` reject (`:171`, sau khi đã `setToast` success) — lúc đó toast success đã bật và `setFormTarget(null)` chưa chạy → người dùng thấy “Đã thêm tuyến” nhưng modal còn mở và trạng thái không invalidate. Chưa phải lỗi thường gặp (invalidate ít khi reject) nhưng là **thứ tự sai**: nên invalidate trước/không phụ thuộc vào nó để đóng modal.
2. **Nút bật/tắt trạng thái trên bảng không có pending/disable.** Nút `role="switch"` (`tuyen-duong-table.tsx:116-127`) gọi `handleToggle` → `handleSetStatus` async, nhưng bảng **không nhận `updatePending`/không disable**; bấm liên tục nhiều lần có thể bắn nhiều PATCH cùng trạng thái (mỗi lần đều `mutateAsync`). `updatePending` chỉ được truyền cho confirm modal (`board.tsx:162`), **không** cho bảng. Kích hoạt lại tuyến (`handleToggle:129`) cũng không có busy.
3. **Khu vực mất khả dụng khi `GET /areas` lỗi nhưng không chặn lưu đúng cách**: khi `areasError`, 2 `Select` bị `disabled` (`form-body.tsx:63,121,149`) và load lại qua nút “Thử lại”, nhưng **ô “Mã tuyến”, km, phút, giá vẫn nhập được**, và validation chỉ báo “Chọn điểm đi/đến” (`tuyen-duong-form.ts:96-103`) — người dùng có thể bấm Lưu trong khi bắt buộc phải có area ⇒ không thể hoàn thành form mà lại không thấy lý do (banner lỗi chỉ ở trên). Chấp nhận được nhưng nên disable nút submit khi `areasError || areasLoading` (hiện `saving` là điều kiện disable duy nhất — `form-body.tsx:247`).
4. **Bật lại tuyến (ACTIVE) không có xác nhận, tắt tuyến (INACTIVE) có confirm** — bất đối xứng. `handleToggle` (`use-tuyen-duong-board.ts:124-130`) mở confirm chỉ khi tuyến đang active; bật lại chạy ngay. Không sai nghiệp vụ, nhưng chưa có thông báo “tuyến sẽ dùng lại được để tạo chuyến mới” rõ ràng trước khi bật.

### P2 — Dữ liệu/lọc/hiển thị/hiệu năng

5. **Lọc/sắp xếp/phân trang client-side** (`use-tuyen-duong-board.ts:72-91`, `PAGE_SIZE = 5`): tải full danh sách rồi cắt trang. Với vài trăm tuyến, tải chậm và nút phân trang chỉ hoạt động sau khi tải xong toàn bộ. Chưa có sort theo cột nào (bảng không có sort).
6. **Tìm kiếm không tìm theo `name` tuyến** (`use-tuyen-duong-board.ts:78` chỉ ghép `code + from + to`). Nếu dữ liệu `name` khác 2 area (đúng tình huống bug đã biết `.agents/be-tuyen-duong-name-area.md`), tìm theo tên tuyến mà người dùng nhớ sẽ **không khớp** vì `from/to` lấy từ area. Nhất quán với quyết định “không tin `name`”, nhưng người dùng sẽ thấy lạ nếu họ quen tên tuyến trong DB.
7. **`handleConfirmPause` không reset `pauseTarget` khi lỗi** (`use-tuyen-duong-board.ts:132-136`): `handleSetStatus` tự `catch` và set toast error (không throw), nên `await handleSetStatus(...)` **luôn resolve** → `setPauseTarget(null)` **luôn chạy** kể cả khi PATCH thất bại. Kết quả: modal đóng dù tắt tuyến lỗi, toast error đứng riêng. Hành vi có thể chấp nhận (đóng + báo lỗi), nhưng **không nhất quán**: người dùng không được xem lại ngữ cảnh để thử lại. Đây là logic dễ gây hiểu nhầm, nên xử lý rõ (đóng có chủ đích + toast lỗi, hoặc giữ modal khi lỗi).
8. **Áreas dropdown đổ toàn bộ danh mục, không search/level**: như mục 2. Rủi ro UX lớn khi danh mục area tăng. `Select` không có ô gõ tìm.
9. **Validate chưa khớp backend ở biên**:
   - `km`: form `type="number" step="any"` không có `min` HTML (`form-body.tsx:172-183`), validate chỉ `km > 0` (`tuyen-duong-form.ts:108-111`) → BE `@Positive BigDecimal` khớp, nhưng FE **không chặn số âm nhập qua bàn phím** (chỉ báo lỗi sau submit). `min={1}` chỉ có ở `min` phút (`:196`).
   - `price`: FE chỉ `price >= 0` (`tuyen-duong-form.ts:116-119`), khớp BE `@PositiveOrZero Long`; nhưng nhập số thập phân (vd `100000.5`) → `Number` ra float gửi BE `Long` → BE ghi đè/cắt hoặc lỗi kiểu; FE không làm tròn/validate số nguyên.
   - `km` là số thực; BE lưu `BigDecimal` — FE gửi `Number` có thể mất chính xác với nhiều chữ số thập phân; chấp nhận được.
   - `code`: FE chặn >50 (`:83-85`) khớp BE `@Size(max=50)` (`CreateRouteRequest.java:22`). **Không** có validate ký tự/khoảng trắng giữa — BE `normalizeCode` chỉ `trim().toUpperCase()`, nên code có dấu cách bên trong vẫn lưu (hành vi BE, không phải lỗi FE).
10. **`name` ghép có thể rỗng nếu area chưa tải**: `areaNameById[values.originAreaId] ?? ""` (`use-tuyen-duong-board.ts:141-142`) → nếu user chọn area có id nhưng `areas` chưa có trong map (race/hiếm), `name` = `" → "` (rỗng 2 đầu) → BE `@NotBlank` reject; nhưng thực tế form bị khóa khi areas lỗi nên hiếm. Vẫn là giả định FE “chắc chắn có tên area”, nên có fallback.
11. **Không reset bộ lọc khi đổi hãng**: `tuyen-duong-filters-store` (`search/trangThai/page`) không được reset ở đâu ngoài nút “Đặt lại”; `company-bootstrap.tsx:30` đổi `companyId` nhưng không `reset()`. Chuyển sang hãng khác vẫn giữ search/page cũ → có thể thấy “Không tìm thấy tuyến” ngay khi đổi hãng.
12. **`notes` trong `_data/tuyen-duong.ts`**: `TuyenDuong` không có field `name`/`originAreaId`, nên khi edit form gửi `toTuyenDuongFormState(raw)` (`form-modal.tsx:69`) — đúng. Không bug.

### P3 — Nhỏ / a11y / copy

13. **`aria-labelledby` cho `Select`**: form dùng `FormField` (label `htmlFor=id`) + `Select id={id}` → label gắn với **button trigger** là hợp lệ, `aria-invalid` có được truyền (`select.tsx:196`). OK. Nhưng `FormField` render lỗi chữ đỏ qua `[data-invalid]` — `form-body` truyền `invalid` xuống, tốt.
14. **Lỗi backend trả tiếng Anh**: `RouteServiceImpl` ném `"Route code already exists for this company"`, `"Origin and destination areas must be different"` (`RouteServiceImpl.java:74,154-157`) → FE hiển thị thẳng `ApiError.message` lên `form-status` (`use-tuyen-duong-form.ts:21-25`) và toast (`use-tuyen-duong-board.ts:22-26`) → người dùng Việt thấy tiếng Anh.
15. **`formatUpdated` dùng `new Date()` + giờ địa phương**: cột “cập nhật dd/MM/yyyy” có thể lệch 1 ngày tùy timezone khi gần nửa đêm. Nhỏ.
16. **Nút “Tìm kiếm” không debounce**: `search` ghi trực tiếp vào store mỗi `onChange` (`tuyen-duong-toolbar.tsx:36`) và `filtered` tính lại mỗi keystroke — với danh sách nhỏ thì ổn; với list lớn thì lag. Không phải bug.
17. **Copy “Đã ngừng tuyến … không còn dùng để tạo chuyến mới”** (`use-tuyen-duong-board.ts:115-116`) — chưa chắc `/chuyen` lọc `status === "ACTIVE"`: kiểm `use-chuyen-board.ts:102` map `routes` **không lọc `status`** → tuyến INACTIVE vẫn có trong dropdown chọn tuyến khi tạo chuyến ở `/chuyen`. Vậy câu “không còn dùng để tạo chuyến mới” **chưa đúng thực tế** (đúng backend nhưng FE `/chuyen` chưa lọc). Đây là lỗi **liên route**, nên rà ở `/chuyen`.
18. **Bảng không có `aria-live` khi số dòng đổi sau mutation** — toast lo phần này, chấp nhận.
19. **`use-tuyen-duong-board.ts:64` comment** khẳng định `tripCount` backend trả sẵn — đúng; giữ.

---

## Thứ tự xử lý đề xuất

1. **P1**: thêm pending/disable cho nút switch trạng thái trên bảng (truyền `updatePending` xuống table); rà lại thứ tự `setToast`/`invalidate`/`setFormTarget(null)` trong `handleFormSave`; disable nút Lưu khi `areasError`/`areasLoading`.
2. **P2**: chuyển search/filter/phân trang sang server nếu backend bổ sung `q/status/page`; tối thiểu dùng `useAreas({ keyword, type })` hoặc combobox search để thay dropdown toàn bộ; reset filter khi đổi hãng; validate số nguyên cho giá/km; sửa copy “không còn dùng để tạo chuyến mới” hoặc buộc `/chuyen` lọc `ACTIVE`.
3. **P2 (hợp đồng)**: thống nhất `name` tuyến — hoặc giữ suy diễn ở FE như hiện tại (và ghi rõ), hoặc bỏ `name` khỏi payload và yêu cầu BE tự sinh (`RouteServiceImpl.createRoute` NPE hiện tại — xem `.agents/be-tuyen-duong-name-area.md`); chọn một hướng để tránh 2 nguồn `name`.
4. **P3**: dọn dead code `get-route.ts`/`use-route.ts` (hoặc dùng cho drawer chi tiết nếu cần), xóa class `td-form-grid`/`td-toolbar`, gộp `EMPTY_INVALID` trùng, chuyển `_data/tuyen-duong.ts` về `_utils/`, Việt hóa message BE hoặc map lỗi.

---

## Ghi chú kiểm chứng

- `npx tsc --noEmit`: pass (exit 0, không output).
- `npm run lint`: pass (eslint không báo lỗi/warning).
- Không chạy dev server → chưa kiểm runtime request thực tế; các kết luận API dựa trên đọc code FE + backend.
- Backend có tồn tại tại `../ViVuViet-backend` và đã đối chiếu `RouteController`, `RouteServiceImpl`, `Create/UpdateRouteRequest`, `RouteResponse`, `AreaController`, `AreaRepository`.
