import type { BookingStatus, TicketResponse } from "@/api/booking/types";

/* Kiểu dữ liệu chuyến xe dùng chung cho các endpoint quản lý /bus-companies/{id}/trips. */

/* Trạng thái vận hành của chuyến. */
export type TripStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "TERMINATED";

/* Trạng thái mở bán của chuyến. */
export type TripSalesStatus = "CLOSED" | "OPEN" | "PAUSED";

/* Trạng thái phân công tài xế của chuyến. */
export type DriverAssignmentStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "REJECTED"
  | "PREPARING"
  | "ARRIVED"
  | "COMPLETED"
  | "REPLACED";

/* Thông tin chuyến xe của hãng. */
export type TripResponse = {
  id: string;
  companyId: string;
  companyName: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  originAreaId: string;
  originAreaName: string;
  destinationAreaId: string;
  destinationAreaName: string;
  tripCode: string;
  departureAt: string;
  expectedArrivalAt: string;
  actualDepartureAt: string | null;
  actualArrivalAt: string | null;
  bookingCutoffAt: string | null;
  baseFareAmount: number;
  status: TripStatus;
  salesStatus: TripSalesStatus;
  createdAt: string;
  updatedAt: string;
};

/* Body tạo chuyến nháp từ tuyến mẫu (POST /bus-companies/{id}/trips). */
export type CreateTripPayload = {
  routeId: string;
  tripCode: string;
  departureAt: string;
  expectedArrivalAt: string;
  bookingCutoffAt?: string;
};

/* Body cập nhật chuyến nháp; trường không gửi được giữ nguyên. */
export type UpdateTripPayload = {
  tripCode?: string;
  departureAt?: string;
  expectedArrivalAt?: string;
  bookingCutoffAt?: string;
};

/* Tham số lọc danh sách chuyến; tất cả đều tùy chọn. */
export type ListTripsQuery = {
  date?: string;
  status?: TripStatus;
  routeId?: string;
  assignmentStatus?: "ASSIGNED" | "UNASSIGNED";
};

/* Phân công xe và tài xế hiện tại của chuyến. */
export type TripAssignmentResponse = {
  tripId: string;
  vehicleId: string | null;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  assignedAt: string | null;
};

/* Body gán hoặc thay xe và tài xế cho chuyến. */
export type AssignTripPayload = {
  vehicleId: string;
  driverId: string;
};

/* Một đặt vé kèm danh sách hành khách và ghế trên chuyến. */
export type TripPassengerBookingResponse = {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  passengers: TicketResponse[];
};