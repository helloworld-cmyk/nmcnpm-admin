Đã rà soát toàn bộ route `src/app/(admin)/khach-hang`, lớp API `src/api/khach-hang`, store và so với các màn anh em (`xe`, `don-dat`). `tsc` và `eslint` đều pass, nhưng có nhiều vấn đề về dữ liệu/nghiệp vụ. Kết quả:

## 1. Còn dùng mock data không?
Không còn **mảng mock tĩnh** nào (`.agents`/`design` cũng không có màn này). Nhưng còn **dữ liệu ghi cứng / suy diễn**:


- `_data/customers.ts` nằm trong `_data/` (quy ước dành cho mock) nhưng thực chất chỉ chứa type + hằng + helper — đặt sai chỗ theo AGENTS §7.1 (giống `xe`).

## 2. Chỗ nào chưa ghép API?
- **Lọc/tìm kiếm/phân trang/sắp xếp đang làm hoàn toàn client-side.** `_hooks/use-khach-hang-board.ts:30` gọi `useCustomers(companyId)` **không truyền `q`/`accountStatus`**, dù `list-customers.ts:13-17` và `ListCustomersQuery` (`api/khach-hang/api/types.ts:24-28`) đã hỗ trợ. Toàn bộ dữ liệu được tải hết rồi lọc trong RAM, phân trang cứng `PAGE_SIZE = 5` (`use-khach-hang-board.ts:13`).
- **Giá trị filter không khớp BE:** store lưu `trangThai` = `"active" | "locked"` (`khach-hang-filters-store.ts:8`), còn BE dùng `ACTIVE|PENDING|SUSPENDED|CLOSED`. `"locked"` **không tồn tại** ở BE → kể cả khi nối cũng sẽ gửi sai.
- **Nút "Xem tất cả đơn đặt"** (`khach-hang-detail-modal.tsx:106`) trỏ `/don-dat` nhưng **không truyền `customerId`**, dù API bookings hỗ trợ `customerId` (`don-dat/api/list-bookings.ts:25`). Bấm vào sẽ ra toàn bộ đơn của hãng, mất ngữ cảnh khách.
- `_utils/map-customer.ts:72` — `daThuTien: ticket.status === "CONFIRMED"` dùng nhầm trạng thái xác nhận vé thay vì cờ **`paymentCollected`** đã có sẵn trong `TicketResponse` (`booking/types.ts:28`). Vé CONFIRMED chưa thu tiền vẫn hiện "đã thu tiền".

## 3. Chỗ nào thiếu API?
- **Danh sách khách không có phân trang server-side.** `list-customers.ts` khai báo trả `CompanyCustomerResponse[]` (không `PageResponse`, không `page/size`). Đây là endpoint duy nhất trong nhóm màn không phân trang → cần BE bổ sung kiểu `PageResponse` + `page/size` (như `/bookings`).
- **Thiếu lọc theo trạng thái đặt vé / khoảng thời gian**: `ListCustomersQuery.bookingStatus` tồn tại nhưng UI không có; không có tham số lọc ngày đặt.
- **Không có API/logic ghi**: màn chỉ đọc; nếu thiết kế có "khóa/mở khóa tài khoản" thì chưa có endpoint (UI cũng không có nút) — cần xác nhận nghiệp vụ.

## 4. API có trường nào bị thiếu?
`CompanyCustomerResponse` (danh sách, `api/khach-hang/api/types.ts:13-21`) thiếu so với nhu cầu UI:
- `customerCode` — mã khách thật (đang phải tự chế).
- `createdAt` — **ngày tạo tài khoản** (modal hiển thị "Ngày tạo tài khoản" nhưng danh sách không có trường này, xem mục 6).
- `totalSpent`/`tongChiTieu` — tổng chi tiêu (đang ép `0`).
- Thiếu `page/size/totalElements` (phân trang, mục 3).

`CompanyCustomerDetailResponse`: đủ trường cơ bản, nhưng:
- `bookings[]` trả **không giới hạn/sắp xếp** → list vé có thể rất lớn và không đảm bảo "gần đây" (xem mục 6).
- `phoneVerifiedAt`/`updatedAt` (`types.ts:75-77`) BE trả nhưng FE không dùng.

## 5. File/code thừa, không có tác dụng?
Không có file nào của màn bị bỏ hoàn toàn — mọi component/store/API đều được import. Nhưng có **dead code nhỏ**:
- `use-khach-hang-board.ts:106` trả `detailId` nhưng **không consumer nào dùng** (`KhachHangBoard` chỉ destructure `setDetailId`).
- `ListCustomersQuery.bookingStatus` (`types.ts:27`) và nhiều field response (`companyHotline`, `timezone`, `routeId`, `routeCode`, `routeName`, `originAreaId`…) không được map — không sai nhưng dư.
- `_utils/tach-email.ts` chỉ dùng ở **1 component** (`khach-hang-table.tsx`) → theo AGENTS §1 nên inline vào TSX hoặc gộp vào `_utils` khác; hiện tách file riêng hơi dư.

## 6. Vấn đề khác
- **Cột "Đặt gần nhất" vs "Ngày tạo tài khoản" dùng chung một field.** `mapCustomer` gán `ngayTao = lastBookingAt`, còn `mapCustomerDetail` ghi đè `ngayTao = createdAt` (`map-customer.ts:48` vs `:88`). Bảng ghi nhãn "Đặt gần nhất" (`khach-hang-table.tsx:24`), modal lại ghi nhãn "Ngày tạo tài khoản" (`khach-hang-detail-modal.tsx:45`). Khi detail đang tải, modal hiển thị **nhầm ngày đặt vé thành ngày tạo tài khoản**.
- **`veDaDat` không nhất quán:** danh sách dùng `customer.bookingCount` (`:49`), chi tiết dùng `bookingCount ≠ bookings.length` (`:89`). Nếu 1 đơn có nhiều vé (nhiều ticket), số ở bảng và ở modal **khác nhau** cho cùng một khách.
- **Sort theo ngày bị NaN khi thiếu ngày:** `soSanhNgay` (`customers.ts:54-58`) parse `"—"` → `NaN`, comparator trả `NaN` → thứ tự sắp xếp sai/không ổn định với khách chưa từng đặt vé.
- **`accountStatus` bị ép 2 mức:** `mapTrangThai` (`map-customer.ts:11-13`) gộp `PENDING/SUSPENDED/CLOSED` thành `"locked"`; dropdown lọc chỉ có active/locked → không thể lọc riêng tài khoản chờ duyệt/đình chỉ.
- **"Lịch sử vé gần đây" không sort:** `detail.bookings.flatMap(...)` giữ nguyên thứ tự BE, không đảm bảo mới nhất trước (`map-customer.ts:64-76`).
- **`tongChiTieu` tính theo `quotedTotalAmount`** (giá báo) cho booking CONFIRMED — có thể lệch với số tiền thực thu (`collectedAmount`).
- **Empty state sai ngữ cảnh:** `sorted.length === 0` luôn hiện "Không tìm thấy khách hàng … khớp từ khóa và trạng thái" (`khach-hang-empty-state.tsx`) kể cả khi hãng **chưa có khách nào** (giống bug đã báo ở màn `xe`).
- **Bộ lọc luôn render kể cả khi chưa chọn hãng** (`khach-hang-board.tsx:96-102` render trước `renderBody()`), khác `don-dat` chỉ render khi `ready`.
- **Thiếu chỉ báo "Đang cập nhật..."** như `don-dat` khi `isFetching`.
- **`page.tsx:11`** destructure `{}` từ `PageProps` không cần thiết (thừa, không sai).

### Ưu tiên (senior view)
1. Sửa field gộp `ngayTao` → tách rõ `lastBookingAt` và `createdAt`; sửa `daThuTien` dùng `paymentCollected`.
2. Thống nhất nghĩa `veDaDat` (ticket vs booking) ở cả list và detail.
3. Bổ sung `createdAt`/`customerCode`/`totalSpent` + phân trang cho endpoint list; chuyển search/lọc/phân trang lên server (map `trangThai` đúng enum BE).
4. Truyền `customerId` khi nhảy sang `/don-dat`.
5. Fix sort ngày NaN, sort lịch sử vé theo `departureAt`, xử lý empty-state theo ngữ cảnh; dọn `detailId` thừa.

Điểm cộng: kiến trúc hook/UI tách đúng AGENTS §7.3, store Zustand §5, icon dùng sprite, không còn mock array, lint/tsc sạch.