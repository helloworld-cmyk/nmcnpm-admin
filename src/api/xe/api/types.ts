/* Kiểu dữ liệu xe dùng chung cho các endpoint /bus-companies/{id}/vehicles. */

/* Trạng thái của xe. */
export type VehicleStatus = "ACTIVE" | "MAINTENANCE" | "RETIRED";

/* Thông tin xe của hãng. */
export type VehicleResponse = {
  id: string;
  companyId: string;
  plateNumber: string;
  vehicleModel: string;
  passengerCapacity: number;
  inspectionExpiresOn: string | null;
  vehicleType: string | null;
  manufacturingYear: number | null;
  fuelType: string | null;
  color: string | null;
  seatLayoutId: string | null;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
};

/* Tham số lọc danh sách xe; tất cả đều tùy chọn. */
export type ListVehiclesQuery = {
  q?: string;
  status?: VehicleStatus;
};

/* Body tạo xe cho hãng. */
export type CreateVehiclePayload = {
  plateNumber: string;
  vehicleModel: string;
  passengerCapacity: number;
  inspectionExpiresOn?: string;
  vehicleType?: string;
  manufacturingYear?: number;
  fuelType?: string;
  color?: string;
};

/* Body cập nhật xe; trường không gửi được giữ nguyên. */
export type UpdateVehiclePayload = {
  plateNumber?: string;
  vehicleModel?: string;
  passengerCapacity?: number;
  inspectionExpiresOn?: string;
  vehicleType?: string;
  manufacturingYear?: number;
  fuelType?: string;
  color?: string;
  status?: VehicleStatus;
};

/* Body cấu hình sơ đồ ghế; hàng và cột bắt đầu từ 1. Sơ đồ một tầng, không phân hạng ghế. */
export type ConfigureVehicleSeatsPayload = {
  name: string;
  seats: {
    seatCode: string;
    rowNo: number;
    columnNo: number;
  }[];
};

/* Một ghế trong sơ đồ ghế của xe. */
export type VehicleSeatResponse = {
  id: string;
  seatCode: string;
  rowNo: number;
  columnNo: number;
};

/* Sơ đồ ghế hiện tại của xe; `seatLayoutId`/`name` là null khi xe chưa cấu hình. */
export type VehicleSeatLayoutResponse = {
  vehicleId: string;
  seatLayoutId: string | null;
  name: string | null;
  seats: VehicleSeatResponse[];
};

/* Loại giấy tờ của xe. */
export type VehicleDocumentType =
  | "REGISTRATION"
  | "INSPECTION"
  | "LIABILITY_INSURANCE"
  | "PHYSICAL_DAMAGE_INSURANCE";

/* Trạng thái hiệu lực của giấy tờ xe. */
export type VehicleDocumentStatus =
  | "VALID"
  | "EXPIRED"
  | "NOT_YET_VALID"
  | "UNKNOWN";

/* Một giấy tờ của xe. */
export type VehicleDocumentResponse = {
  id: string;
  type: VehicleDocumentType;
  documentNumber: string | null;
  issuer: string | null;
  description: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
  status: VehicleDocumentStatus;
  updatedAt: string;
};

/*
 * Body thêm hoặc cập nhật giấy tờ xe. Backend thay thế toàn bộ bản ghi nên
 * frontend phải gửi đủ 5 trường; trường muốn xóa gửi `null` (không gửi sẽ bị
 * backend set null ngoài ý muốn).
 */
export type VehicleDocumentPayload = {
  documentNumber: string | null;
  issuer: string | null;
  description: string | null;
  issuedOn: string | null;
  expiresOn: string | null;
};
