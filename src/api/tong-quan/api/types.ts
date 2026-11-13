import type { TripStatus } from "@/api/chuyen/api/types";

/* Kiểu dữ liệu tổng quan dùng chung cho các endpoint /bus-companies/{id}/dashboard. */

/* Khoảng thời gian lọc tổng quan; ngày định dạng yyyy-MM-dd. */
export type DashboardRangeQuery = {
  from?: string;
  to?: string;
};

/* KPI tổng quan của hãng trong kỳ. */
export type DashboardSummaryResponse = {
  from: string | null;
  to: string | null;
  totalTrips: number;
  scheduledTrips: number;
  inProgressTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  draftTrips: number;
  terminatedTrips: number;
  confirmedTickets: number;
  confirmedTicketValue: number;
  previousFrom: string | null;
  previousTo: string | null;
  previousTotalTrips: number;
  previousScheduledTrips: number;
  previousInProgressTrips: number;
  previousCompletedTrips: number;
  previousCancelledTrips: number;
  previousConfirmedTickets: number;
  previousRevenue: number;
  totalTripsChangePct: number | null;
  scheduledTripsChangePct: number | null;
  inProgressTripsChangePct: number | null;
  completedTripsChangePct: number | null;
  cancelledTripsChangePct: number | null;
  confirmedTicketsChangePct: number | null;
  revenueChangePct: number | null;
  currency: string;
  actualCollected: boolean;
  ticketValueNote: string;
};

/* Một điểm tổng hợp chuyến theo ngày khởi hành. */
export type DashboardTripPointResponse = {
  date: string;
  totalTrips: number;
  revenue: number;
  ticketCount: number;
  byStatus: Partial<Record<TripStatus, number>>;
};

/* Một tài xế trong top theo số chuyến được phân công. */
export type DashboardDriverResponse = {
  driverId: string;
  driverName: string;
  assignedTrips: number;
  completedTrips: number;
  inProgressTrips: number;
  scheduledTrips: number;
  cancelledTrips: number;
  terminatedTrips: number;
  revenue: number;
  rating: number | null;
};

/* Trạng thái phân công tài xế cho chuyến. */
export type DriverAssignmentStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "REJECTED"
  | "PREPARING"
  | "ARRIVED"
  | "COMPLETED"
  | "REPLACED";

/* Loại sự cố trên chuyến. */
export type IncidentType =
  | "VEHICLE_BREAKDOWN"
  | "ACCIDENT"
  | "TRAFFIC"
  | "PASSENGER"
  | "HEALTH"
  | "OTHER";

/* Trạng thái xử lý sự cố. */
export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

/* Tham số số dòng cho danh sách ngắn ở dashboard; 1–100. */
export type DashboardLimitQuery = {
  limit?: number;
};

/* Tham số lọc top tuyến: kỳ ngày và số dòng. */
export type TopRoutesQuery = {
  from?: string;
  to?: string;
  limit?: number;
};

/* Một chuyến trong danh sách chuyến hôm nay của hãng. */
export type DashboardTodayTripResponse = {
  tripId: string;
  tripCode: string;
  routeName: string;
  originAreaName: string;
  destinationAreaName: string;
  departureAt: string;
  actualDepartureAt: string | null;
  tripStatus: TripStatus;
  vehicleId: string | null;
  vehiclePlate: string | null;
  driverId: string | null;
  driverName: string | null;
  assignmentStatus: DriverAssignmentStatus | null;
  lateMinutes: number | null;
};

/* Một tuyến trong top tuyến theo giá trị vé CONFIRMED. */
export type DashboardRouteResponse = {
  routeId: string;
  routeCode: string;
  routeName: string;
  tripCount: number;
  passengerCount: number;
  revenue: number;
  seatCount: number;
  occupancyRate: number | null;
};

/* Một sự cố đang mở/đang xử lý của hãng. */
export type DashboardIncidentResponse = {
  incidentId: string;
  incidentCode: string;
  tripId: string;
  tripCode: string;
  type: IncidentType;
  typeLabel: string;
  description: string;
  driverId: string | null;
  driverName: string | null;
  reportedAt: string;
  ageMinutes: number;
  status: IncidentStatus;
};
