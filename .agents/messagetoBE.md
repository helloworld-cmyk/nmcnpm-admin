# Yêu cầu BE — màn Tổng quan (Admin)

Trang: `http://localhost:3000/tong-quan`
Base path hiện có: `/bus-companies/{companyId}/dashboard/*`
Quy ước chung: response bọc envelope `{ code, message, wsResponse }` (FE đã unwrap, kiểu khai báo = `wsResponse`); lỗi business trả `code != 0`. Ngày dùng `yyyy-MM-dd`; thời điểm dùng ISO-8601. Khi không truyền `from`/`to` thì BE tự áp mặc định (đề xuất 14 ngày gần nhất).

Hiện FE đã nối được 3 endpoint: `GET /dashboard/summary` (6 thẻ KPI), `GET /dashboard/trips` (cột số chuyến trên biểu đồ), `GET /dashboard/top-drivers` (Top tài xế).

Dưới đây là các phần **còn thiếu / cần sửa** để màn Tổng quan chạy đủ.

---

## 1. Biểu đồ "Hoạt động chuyến đi" — thiếu doanh thu theo ngày

`GET /bus-companies/{companyId}/dashboard/trips` hiện chỉ trả `{ date, totalTrips, byStatus }`, **không có doanh thu** → FE đang hardcode `revenue = 0` nên đường/area "Doanh thu (triệu đ)" không bao giờ hiển thị (chỉ còn cột số chuyến).

**Cần:** thêm doanh thu (giá trị vé) theo từng ngày vào mỗi điểm dữ liệu.

```jsonc
// GET /bus-companies/{companyId}/dashboard/trips?from=2026-10-16&to=2026-10-29
// wsResponse: mảng điểm theo ngày
[
  {
    "date": "2026-10-16",
    "totalTrips": 96,
    "revenue": 32400000,        // [THÊM] doanh thu/giá trị vé trong ngày
    "ticketCount": 240,         // [THÊM, tùy chọn] số vé bán trong ngày
    "byStatus": { "SCHEDULED": 10, "IN_PROGRESS": 5, "COMPLETED": 78, "CANCELLED": 3 }
  }
]
```

- Đơn vị `revenue`: VND (số nguyên), giống `confirmedTicketValue` trong `/dashboard/summary`.
- **Phương án thay thế (đỡ việc BE hơn):** nếu `/bus-companies/{id}/reports/revenue` (domain doanh thu, đã có) đã trả `periods: [{ date, tickets, ticketValue }]` theo ngày thì FE có thể ghép 2 nguồn lại; khi đó chỉ cần xác nhận endpoint này trả đúng granularity theo ngày, khỏi thêm field mới.
- (Tùy chọn) Banner "so với kỳ trước": thiết kế gốc có `+9,2%`. Muốn hiển thị thì BE cần trả thêm giá trị kỳ trước hoặc % thay đổi (`previousRevenue`, `revenueChangePct`).

---

## 2. "Chuyến hôm nay" — chưa có endpoint (đang là placeholder)

Thiết kế cần bảng các chuyến trong ngày với: tuyến (điểm đi → điểm đến), giờ khởi hành, tài xế (hoặc "Chưa phân"), **trạng thái lệnh phân công**, và **cảnh báo trễ**.

**Cần:** endpoint mới.

```jsonc
// GET /bus-companies/{companyId}/dashboard/today-trips
// wsResponse: mảng
[
  {
    "tripId": "...",
    "tripCode": "VC-1042",
    "routeName": "Hà Nội ↔ Hải Phòng",
    "originAreaName": "Hà Nội",
    "destinationAreaName": "Hải Phòng",
    "departureAt": "2026-11-12T09:30:00+07:00",
    "vehicleId": "...",           // nullable nếu chưa gán
    "vehiclePlate": "29B-123.45", // nullable
    "driverId": null,             // null → FE hiển thị "Chưa phân"
    "driverName": null,
    "assignmentStatus": "ASSIGNED", // dùng DriverAssignmentStatus: ASSIGNED | ACCEPTED | PREPARING | ARRIVED | COMPLETED | REPLACED
    "lateMinutes": 8              // số phút trễ so với departureAt; 0/null nếu không trễ
  }
]
```

- `assignmentStatus` map với nhãn thiết kế: `ASSIGNED`→"Chưa nhận lệnh", `ACCEPTED`→"Đã nhận lệnh", `PREPARING`→"Đang chuẩn bị", `ARRIVED`→"Đã có mặt". (Enum này tài xế đã có — xem `src/api/tai-xe/api/types.ts`.)
- Sắp xếp theo `departureAt` tăng dần; giới hạn ~10 dòng nếu cần.

---

## 3. "Top tuyến" (all time) — chưa có endpoint

Thiết kế cần: tuyến, số chuyến, số khách, doanh thu, tỉ lệ lấp ghế.

**Cần:** endpoint mới.

```jsonc
// GET /bus-companies/{companyId}/dashboard/top-routes?from=&to=&limit=5
// wsResponse: mảng (BE chọn all-time khi không truyền from/to)
[
  {
    "routeId": "...",
    "routeCode": "HN-HP",
    "routeName": "Hà Nội ↔ Hải Phòng",
    "tripCount": 32,
    "passengerCount": 148,
    "revenue": 12480000,     // VND
    "occupancyRate": 0.86    // 0..1 (FE tự format "86%"); hoặc trả thẳng 86 nếu muốn
  }
]
```

---

## 4. "Sự cố đang mở" — chưa có endpoint (đang là placeholder)

Yêu cầu ghi chú: tài xế đã có phần **báo cáo sự cố** ở BE, nhưng admin chưa có API để đọc. Thiết kế cần: mã chuyến, loại sự cố, tài xế, thời gian trôi, trạng thái. Vòng đời sự cố (theo thiết kế màn Chuyến): **Mở → Đang xử lý → Đã xử lý**.

**Cần:** endpoint liệt kê sự cố chưa đóng.

```jsonc
// GET /bus-companies/{companyId}/dashboard/open-incidents
// wsResponse: mảng (chỉ trả sự cố chưa RESOLVED)
[
  {
    "incidentId": "...",
    "incidentCode": "CN-1042",
    "tripId": "...",
    "tripCode": "VC-1042",
    "type": "DRIVER_LATE",       // mã loại sự cố
    "typeLabel": "Tài xế đến muộn", // nhãn hiển thị (nếu BE có)
    "description": "Xe thủng lốp giữa tuyến (km 22).",
    "driverId": "...",
    "driverName": "Trần Thị H.",
    "reportedAt": "2026-11-12T08:20:00+07:00",
    "ageMinutes": 22,            // "thời gian trôi"; hoặc để FE tự tính từ reportedAt
    "status": "OPEN"             // OPEN | IN_PROGRESS | RESOLVED
  }
]
```

- **Cần BE xác nhận:** entity sự cố hiện có (tên bảng/trường, mã loại sự cố, có `typeLabel` chưa) để FE map đúng. Nếu tài xế mới chỉ gửi free-text thì đề xuất BE chuẩn hóa thêm `type` (enum) + `typeLabel`.
- Màn Tổng quan hiện chỉ cần list; các thao tác "Nhận xử lý" / "Đóng sự cố" (có trong thiết kế màn Chuyến) sẽ làm ở màn Chuyến, chưa cần cho Tổng quan.

---

## 5. (Tùy chọn) Bổ sung nhỏ

- **KPI có xu hướng:** thiết kế gốc hiển thị "+12% so với hôm qua"; `summary` hiện không có số so sánh. Muốn có thì cần thêm kỳ trước hoặc `*ChangePct`.
- **Top tài xế:** `DashboardDriverResponse` hiện chỉ có số chuyến; thiết kế gốc còn hiển thị **doanh thu** và **rating sao**. Nếu muốn đủ, thêm `revenue` (và `rating` nếu có).

---

## 6. Kiểm tra quyền quản trị khi login

**Hiện trạng BE:** `AuthServiceImpl.login` cho **mọi tài khoản `ACTIVE`** đăng nhập, và `JwtAuthenticationFilter` gán `ROLE_CUSTOMER` cho tất cả → `/me` luôn pass (vì `@PreAuthorize("hasAuthority('ROLE_CUSTOMER')")`).

**Hậu quả:** tài khoản khách hàng thường (không phải `COMPANY_ADMIN` của hãng nào) vẫn đăng nhập được vào admin; sau đó mọi API company-scoped trả 403 → màn trống, không thông báo.

**Cần BE xử lý (chọn 1 hoặc cả 2):**
1. Chặn ngay tại `login`: chỉ trả token cho tài khoản có quyền quản trị (`COMPANY_ADMIN` của một hãng), tài khoản khách hàng thường trả lỗi business (`code != 0`) kèm message rõ ràng.
2. `/me` (hoặc `LoginResponse`) trả đúng `role` / `authorities` / `companies` để FE tự gating sau login, thay vì role cứng `ROLE_CUSTOMER`.

---

## Ghi chú ngoài phạm vi BE
- Tiêu đề "Thứ Năm, 29/10/2026" ở header hiện hardcode phía FE (`dash-head.tsx`) — đây là việc FE, không cần BE.
- Nút "Xuất báo cáo" hiện chỉ là link sang `/doanh-thu`; chưa có luồng xuất file.
