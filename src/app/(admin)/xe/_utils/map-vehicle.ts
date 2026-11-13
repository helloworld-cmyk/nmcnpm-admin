import type { VehicleResponse, VehicleStatus } from "@/api/xe/api/types";

import type { Xe, XeTrangThai } from "../_data/vehicles";

/* Trạng thái xe của backend → nhãn tiếng Việt dùng ở UI. */
const STATUS_TO_TRANG_THAI: Record<VehicleStatus, XeTrangThai> = {
  ACTIVE: "Đang hoạt động",
  MAINTENANCE: "Đang bảo trì",
  RETIRED: "Ngưng sử dụng",
};

/* Nhãn tiếng Việt ở UI → trạng thái gửi lên backend khi cập nhật. */
export const XE_TRANG_THAI_TO_STATUS: Record<XeTrangThai, VehicleStatus> = {
  "Đang hoạt động": "ACTIVE",
  "Đang bảo trì": "MAINTENANCE",
  "Ngưng sử dụng": "RETIRED",
};

/*
 * VehicleResponse → Xe (view-model của màn Quản lý xe).
 * Backend /bus-companies/{id}/vehicles hiện KHÔNG trả tài xế phụ trách → trường
 * này để trống và chỉ được cập nhật cục bộ ở tầng UI (xem local override trong
 * xe-board.tsx).
 */
export function mapVehicle(vehicle: VehicleResponse): Xe {
  return {
    id: vehicle.id,
    bienSo: vehicle.plateNumber,
    loaiXe: vehicle.vehicleModel,
    soCho: vehicle.passengerCapacity,
    taiXeId: null,
    taiXe: null,
    trangThai: STATUS_TO_TRANG_THAI[vehicle.status],
    daGanChuyen: false,
  };
}

/* Map danh sách xe từ backend. */
export function mapVehicles(vehicles: VehicleResponse[]): Xe[] {
  return vehicles.map(mapVehicle);
}
