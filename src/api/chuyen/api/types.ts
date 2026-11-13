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
  cancelledAt: string | null;
  cancellationReason: string | null;
  cancellationDescription: string | null;
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

/* Body hủy chuyến chưa bắt đầu (DRAFT/SCHEDULED). */
export type CancelTripPayload = {
  reason: string;
  description?: string;
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

/* Chuyến nháp trả về sau khi tạo, kèm tiền công tài xế theo chuyến nếu đã nhập. */
export type CreateTripResponse = TripResponse & {
  driverWage: number | null;
};

/* Số ghế của chuyến tính từ inventory chụp; occupancyRate là phần trăm 0–100. */
export type TripSeatSummary = {
  totalSeats: number;
  confirmedSeats: number;
  heldSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  occupancyRate: number;
};

/* Phân công xe/tài xế hiện tại kèm trạng thái phân công của chuyến. */
export type TripDetailAssignment = TripAssignmentResponse & {
  assignmentStatus: DriverAssignmentStatus;
  acceptedAt: string | null;
  rejectionReason: string | null;
  assignedBy: string | null;
  assignedByName: string | null;
  plateNumber: string | null;
  vehicleModel: string | null;
  passengerCapacity: number | null;
  /* false nếu phân công đã bị từ chối hoặc thay thế. */
  active: boolean;
};

/* Một hành khách trong chi tiết chuyến. */
export type TripDetailPassenger = TicketResponse & {
  bookingId: string;
  bookingCode: string;
  bookingStatus: BookingStatus;
  contactName: string;
  contactPhone: string;
};

/* Một mốc lịch sử trạng thái của chuyến. */
export type TripDetailHistoryItem = {
  eventType: string;
  title: string | null;
  occurredAt: string | null;
  expectedAt: string | null;
  actorId: string | null;
  actorName: string | null;
  description: string | null;
  state: "DONE" | "PENDING";
};

/* Khả năng thao tác của chuyến theo trạng thái. */
export type TripDetailActions = {
  canEdit: boolean;
  canAssign: boolean;
  canPublish: boolean;
  canCancel: boolean;
};

/* Dữ liệu đầy đủ cho ngăn chi tiết chuyến của admin hãng. */
export type TripDetailResponse = TripResponse & {
  timezone: string;
  currency: string;
  seats: TripSeatSummary;
  assignment: TripDetailAssignment | null;
  ticketCount: number;
  activeTicketCount: number;
  passengers: TripDetailPassenger[];
  history: TripDetailHistoryItem[];
  /* false nếu chuyến có trước khi hệ thống bắt đầu lưu lịch sử sự kiện. */
  historyComplete: boolean;
  actions: TripDetailActions;
};