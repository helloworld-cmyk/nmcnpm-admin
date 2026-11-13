```sql
-- 1) Kiểm tra trạng thái DB của chuyến VC-1001
SELECT t.id            AS trip_id,
       t.trip_code,
       t.status        AS trip_status,
       t.sales_status,
       t.departure_at,
       t.booking_cutoff_at,
       a.assignment_status,
       a.accepted_at,
       u.full_name     AS driver,
       v.plate_normalized AS plate
FROM trips t
JOIN trip_assignments a ON a.trip_id = t.id
JOIN users u ON u.id = a.driver_user_id
JOIN vehicles v ON v.id = a.vehicle_id
WHERE t.trip_code = 'VC-1001';
```

```sql
-- 2) Cho tài xế nhận lệnh (bỏ điều kiện SCHEDULED vì chuyến đang DRAFT)
UPDATE trip_assignments a
SET assignment_status = 'ACCEPTED',
    accepted_at       = now(),
    rejection_reason  = NULL,
    updated_at        = now()
FROM trips t
WHERE t.id = a.trip_id
  AND t.trip_code = 'VC-1001'
RETURNING a.id, a.trip_id, a.assignment_status, a.accepted_at;
```

Kỳ vọng: SELECT thấy `assignment_status = 'ASSIGNED'`, UPDATE trả 1 dòng `ACCEPTED`; reload màn `/chuyen` badge sẽ đổi thành "Đã nhận lệnh". Nếu muốn đúng luồng backend (driver app chỉ accept khi chuyến `SCHEDULED`), phải publish chuyến trước — nhưng VC-1001 đang `DRAFT` và đã qua giờ khởi hành nên backend sẽ chặn publish.