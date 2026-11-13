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
};

/* Body cập nhật xe; trường không gửi được giữ nguyên. */
export type UpdateVehiclePayload = {
  plateNumber?: string;
  vehicleModel?: string;
  passengerCapacity?: number;
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

/* Sơ đồ ghế hiện tại của xe. */
export type VehicleSeatLayoutResponse = {
  vehicleId: string;
  seatLayoutId: string;
  name: string;
  seats: VehicleSeatResponse[];
};
