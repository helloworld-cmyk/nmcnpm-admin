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
 * Backend hiện chưa trả thông tin tài xế phụ trách nên view-model không có
 * trường này.
 */
export function mapVehicle(vehicle: VehicleResponse): Xe {
  return {
    id: vehicle.id,
    bienSo: vehicle.plateNumber,
    loaiXe: vehicle.vehicleModel,
    soCho: vehicle.passengerCapacity,
    seatLayoutId: vehicle.seatLayoutId,
    trangThai: STATUS_TO_TRANG_THAI[vehicle.status],
  };
}

/* Map danh sách xe từ backend. */
export function mapVehicles(vehicles: VehicleResponse[]): Xe[] {
  return vehicles.map(mapVehicle);
}
