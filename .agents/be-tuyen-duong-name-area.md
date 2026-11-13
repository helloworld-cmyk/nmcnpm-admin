# Bug BE — `routes.name` lệch với `origin_area_id` / `destination_area_id` (và cách FE đã đổi)

Màn liên quan: Quản lý tuyến (`/tuyen-duong`), Quản lý chuyến (`/chuyen`), Tổng quan (`/tong-quan`),
Khách hàng (`/khach-hang`), Tài xế (`/tai-xe`).
Endpoint liên quan: `POST/PUT /bus-companies/{companyId}/routes`, `GET /bus-companies/{companyId}/trips`,
`GET .../dashboard/*`.

## 1. Hiện tượng

Trên màn **Quản lý chuyến**, ô "Tuyến" hiển thị 2 dòng mâu thuẫn:

```
Bắc Ninh → Cần Thơ              ← dòng đậm:  routes.name           (TripResponse.routeName)
BX Bắc Ninh → BX Đà Nẵng        ← dòng xám:  ghép từ 2 area của tuyến
                                              (originAreaName + destinationAreaName)
```

## 2. Nguyên nhân

`routes.name` là **chuỗi độc lập** với `origin_area_id` / `destination_area_id`; không ai ràng buộc
`name` phải khớp 2 khu vực. Một tuyến có thể lưu `name = "Bắc Ninh → Cần Thơ"` nhưng
`destination_area_id` trỏ **Đà Nẵng**.

Dữ liệu DB hiện tại (bảng `routes`), đối chiếu `areas`:

| `code` | `name` | `origin_area_id` | `destination_area_id` | Kết luận |
| --- | --- | --- | --- | --- |
| `TUY-02` | Cà Mau → Cần Thơ | `171356b8…` = Cà Mau | `7b3e718a…` = Cần Thơ | OK |
| `HN-DAD-DEMO` | Hà Nội - Đà Nẵng | `2afd3112…` = Hà Nội | `6ec059d0…` = Đà Nẵng | OK |
| **`TUY-01`** | **Bắc Ninh → Cần Thơ** | `d076e0c2…` = Bắc Ninh | **`aa1b50f9…` = Đà Nẵng** | **SAI** |

`aa1b50f9-d610-46c0-86ee-963d34e06d40` = **Đà Nẵng** (code 48); Cần Thơ là
`7b3e718a-1945-422e-813d-ca01044311ff` (code 92).

`TUY-01` có `updated_at` (2026-11-12 13:47) ≠ `created_at` (2026-11-10 14:31) → tuyến đã bị **sửa**
(đổi điểm đến nhưng không cập nhật `name`).

## 3. Hướng FE đã chọn (KHÔNG tin `routes.name`)

- **GET (hiển thị):** mọi nhãn tuyến trên UI **đều suy ra** từ `originAreaName → destinationAreaName`,
  KHÔNG đọc `routeName`/`route.name`.
  - Helper dùng chung: `src/utils/route-label.ts` (`routeLabel`, `routeLabelWithStation`).
  - Áp dụng ở view-model: `chuyen/_utils/map-trip.ts`, `chuyen/_hooks/use-chuyen-board.ts`
    (gồm cả dropdown chọn tuyến khi tạo chuyến), `tong-quan/_utils/map-dashboard.ts` (chuyến hôm nay),
    `khach-hang/_utils/map-customer.ts` (lịch sử vé).
- **POST/PUT (tạo/sửa tuyến):** FE **bỏ hẳn trường `name`** khỏi payload
  (`CreateRoutePayload`, `UpdateRoutePayload`), và **bỏ luôn ô "Tên tuyến"** trên form
  (người dùng không còn thao tác được với tên tuyến).

## 4. ⚠️ Việc BE BẮT BUỘC làm (nếu không, FE tạo/sửa tuyến sẽ lỗi)

`RouteServiceImpl.createRoute` hiện gọi `request.getName().trim()` (không kiểm null) → khi FE **không
gửi `name`** nữa, dòng này **NPE → 500**. Cần:

1. **`createRoute`**: bỏ phụ thuộc `name` từ request; **tự sinh**
   `name = originArea.getName() + " → " + destinationArea.getName()` từ 2 area đã validate.
2. **`updateRoute`**: khi `originAreaId`/`destinationAreaId` thay đổi → **tự cập nhật lại `name`** theo 2 area
   (đừng giữ `name` cũ). Nếu client còn gửi `name`, validate khớp hoặc bỏ qua.
3. Coi `routes.name` là **dữ liệu dẫn xuất** của 2 area; `RouteResponse` vẫn có thể trả `name` (FE không dùng nữa).

## 5. Việc BE nên làm — bổ sung trường để FE suy nhãn ở 2 màn còn lại

FE cần `originAreaName`/`destinationAreaName` để suy nhãn. Hiện 2 endpoint thiếu:

| Endpoint | Response | Đang có | Cần thêm |
| --- | --- | --- | --- |
| `GET .../dashboard/top-routes` | `DashboardRouteResponse` | `routeName` | `originAreaName`, `destinationAreaName` |
| `GET .../drivers/{id}/trips` (chuyến gần đây của tài xế) | `CompanyDriverTripResponse` | `routeName` | `originAreaName`, `destinationAreaName` |

(`GET .../trips`, `.../dashboard/today-trips`, khách hàng đã có đủ 2 trường này → FE đã đổi xong.)

## 6. Việc BE cần làm — dọn dữ liệu sai

```sql
-- Kiểm tra tuyến đang mâu thuẫn:
SELECT r.id, r.code, r.name, o.name AS origin_area_name, d.name AS destination_area_name
FROM routes r
JOIN areas o ON o.id = r.origin_area_id
JOIN areas d ON d.id = r.destination_area_id
WHERE r.name <> o.name || ' → ' || d.name;

-- Backfill name = điểm đi → điểm đến:
UPDATE routes r
SET name = o.name || ' → ' || d.name
FROM areas o, areas d
WHERE o.id = r.origin_area_id
  AND d.id = r.destination_area_id
  AND r.name <> o.name || ' → ' || d.name;
```

Hiện ít nhất có `TUY-01`. (Nếu nghiệp vụ đúng của `TUY-01` là **Cần Thơ** chứ không phải Đà Nẵng thì thay
`name`, phải sửa `destination_area_id` về `7b3e718a-1945-422e-813d-ca01044311ff` — cần xác nhận vận hành.)

## 7. Việc phụ cần xác nhận (không chặn)

- **Dữ liệu rác**: `TUY-01` có `distance_km = 120000` (km) / `duration_minutes = 130`; `TUY-02` có
  `duration_minutes = 91000` (~63 ngày). Đề nghị rà & chuẩn hóa, và thêm validate ngưỡng hợp lý khi tạo/sửa.
- **Trộn loại area**: `HN-DAD-DEMO` dùng area `type = CITY` (`HN`, `DAD`) còn các tuyến khác `type = province`;
  FE không lọc `type` khi chọn điểm đi/điểm đến. Cần thống nhất: chỉ cho nối giữa `province`, hay cho phép lẫn
  `province` + `CITY`?
- **NPE**: `createRoute` gọi `request.getName().trim()` không kiểm null → nên validate field bắt buộc sớm.
