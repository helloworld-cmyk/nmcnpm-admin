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

/* Điểm dừng đã được chụp vào lịch trình chuyến. */
export type TripStopResponse = {
  id: string;
  stopId: string;
  areaId: string;
  areaCode: string;
  areaName: string;
  sequenceNo: number;
  name: string;
  address: string;
  plannedArrivalAt: string | null;
  plannedDepartureAt: string | null;
  pickupAllowed: boolean | null;
  dropoffAllowed: boolean | null;
};

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
  stops: TripStopResponse[];
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