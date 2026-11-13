import type {
  BookingStatus,
  PassengerTripStatus,
  TicketResponse,
} from "@/api/booking/types";
import type { TripStatus } from "@/api/chuyen/api/types";
import type { DriverAssignmentStatus } from "@/api/tai-xe/api/types";

/* Kiểu dữ liệu đơn đặt vé toàn hãng dùng cho các endpoint /bus-companies/{id}/bookings. */

/* Trạng thái chung của đơn dùng cho 6 tab quản lý đơn (HOLDING/EXPIRED cho đơn chưa xác nhận). */
export type BookingViewStatus =
  | "BOOKED"
  | "PICKED_UP"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED"
  | "HOLDING"
  | "EXPIRED";

/* Trạng thái của một mốc trong lịch sử đơn. */
export type BookingHistoryState = "DONE" | "PENDING";

/* Thông tin chuyến hiển thị kèm chi tiết đơn đặt vé. */
export type CompanyBookingTripResponse = {
  id: string;
  tripCode: string;
  status: TripStatus;
  departureAt: string;
  expectedArrivalAt: string;
  companyId: string;
  companyName: string;
  companyHotline: string;
  timezone: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  originAreaId: string;
  originAreaName: string;
  destinationAreaId: string;
  destinationAreaName: string;
};

/* Thống kê đơn toàn hãng; số vé/giá trị chỉ tính vé CONFIRMED trong đơn CONFIRMED. */
export type CompanyBookingStatisticsResponse = {
  date: string;
  timezone: string;
  todayBookings: number;
  bookedTickets: number;
  totalTicketAmount: number;
  currency: string;
};

/* Số đơn theo từng tab trạng thái; all gồm cả holding/expired. */
export type CompanyBookingStatusCountsResponse = {
  all: number;
  booked: number;
  pickedUp: number;
  completed: number;
  noShow: number;
  cancelled: number;
  holding: number;
  expired: number;
};

/* Tham số lọc danh sách đơn đặt vé toàn hãng; page bắt đầu từ 0, size tối đa 100. */
export type ListBookingsQuery = {
  q?: string;
  status?: BookingStatus;
  viewStatus?: BookingViewStatus;
  passengerTripStatus?: PassengerTripStatus;
  driverId?: string;
  tripId?: string;
  routeId?: string;
  customerId?: string;
  createdFrom?: string;
  createdTo?: string;
  departureFrom?: string;
  departureTo?: string;
  page?: number;
  size?: number;
};

/* Một dòng đơn đặt vé trong danh sách quản lý toàn hãng. */
export type CompanyBookingSummaryResponse = {
  id: string;
  bookingCode: string;
  companyId: string;
  customerId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  tripId: string;
  tripCode: string;
  tripStatus: TripStatus;
  departureAt: string;
  expectedArrivalAt: string;
  timezone: string;
  routeId: string;
  routeName: string;
  originAreaName: string;
  destinationAreaName: string;
  ticketCount: number;
  seatCodes: string[];
  quotedTotalAmount: number;
  currency: string;
  status: BookingStatus;
  viewStatus: BookingViewStatus;
  /* Trạng thái chung của đơn CONFIRMED; null nếu đang giữ chỗ, hủy hoặc hết hạn. */
  passengerTripStatus: PassengerTripStatus | null;
  holdExpiresAt: string | null;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  updatedAt: string;
};

/* Phân công tài xế và xe hiện tại của chuyến trong đơn. */
export type CompanyBookingAssignmentResponse = {
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleId: string;
  plateNumber: string;
  vehicleModel: string;
  passengerCapacity: number;
  status: DriverAssignmentStatus;
};

/* Một mốc lịch sử của đơn đặt vé. */
export type CompanyBookingHistoryItem = {
  eventType: string;
  title: string | null;
  occurredAt: string | null;
  state: BookingHistoryState;
  description: string | null;
};

/* Chi tiết đơn đặt vé của hãng, gồm chuyến, vé/hành khách, phân công và lịch sử. */
export type CompanyBookingResponse = {
  id: string;
  tripId: string;
  trip: CompanyBookingTripResponse;
  bookingCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: BookingStatus;
  holdExpiresAt: string | null;
  quotedTotalAmount: number;
  currency: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  tickets: TicketResponse[];
  companyId: string;
  customerId: string;
  cancellationReason: string | null;
  cancelledBy: string | null;
  viewStatus: BookingViewStatus;
  passengerTripStatus: PassengerTripStatus | null;
  pickupAddress: string;
  dropoffAddress: string;
  /* null nếu chưa có phân công hợp lệ hoặc phân công đã bị từ chối/thay thế. */
  assignment: CompanyBookingAssignmentResponse | null;
  boardedAt: string | null;
  completedAt: string | null;
  history: CompanyBookingHistoryItem[];
  /* false khi dữ liệu cũ thiếu mốc thời gian. */
  historyComplete: boolean;
};

/* Body admin hãng hủy đơn đặt vé; lý do bắt buộc, tối đa 500 ký tự. */
export type CancelBookingPayload = {
  reason: string;
};
