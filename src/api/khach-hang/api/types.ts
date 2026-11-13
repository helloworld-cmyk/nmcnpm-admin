import type {
  BookingStatus,
  TicketResponse,
} from "@/api/booking/types";
import type { TripStatus } from "@/api/chuyen/api/types";

/* Kiểu dữ liệu khách hàng dùng chung cho các endpoint /bus-companies/{id}/customers. */

/* Trạng thái tài khoản khách hàng. */
export type UserAccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "CLOSED";

/* Thông tin khách hàng rút gọn trong danh sách. */
export type CompanyCustomerResponse = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  accountStatus: UserAccountStatus;
  bookingCount: number;
  lastBookingAt: string | null;
};

/* Tham số lọc danh sách khách hàng; tất cả đều tùy chọn. */
export type ListCustomersQuery = {
  q?: string;
  accountStatus?: UserAccountStatus;
  bookingStatus?: BookingStatus;
};

/* Thông tin chuyến và hãng hiển thị kèm đặt vé của khách. */
export type BookingTripResponse = {
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

/* Một đặt vé của khách tại hãng. */
export type CompanyCustomerBookingResponse = {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  quotedTotalAmount: number;
  currency: string;
  holdExpiresAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  trip: BookingTripResponse;
  tickets: TicketResponse[];
};

/* Chi tiết khách hàng kèm lịch sử booking tại hãng. */
export type CompanyCustomerDetailResponse = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  accountStatus: UserAccountStatus;
  phoneVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  bookings: CompanyCustomerBookingResponse[];
};
