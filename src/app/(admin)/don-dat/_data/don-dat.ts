import type { PassengerTripStatus } from "@/api/booking/types";
import type { BookingViewStatus } from "@/api/don-dat/api/types";

/* Hằng số + nhãn hiển thị cho màn Quản lý đơn đặt toàn hãng. */

/* Tab trạng thái đơn; mỗi tab (trừ "all") ứng với một BookingViewStatus. */
export type DonDatTab =
  | "all"
  | "booked"
  | "pickedUp"
  | "completed"
  | "noShow"
  | "cancelled"
  | "holding"
  | "expired";

export const DON_DAT_TABS: { value: DonDatTab; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "booked", label: "Đã đặt" },
  { value: "pickedUp", label: "Đã đón" },
  { value: "completed", label: "Hoàn thành" },
  { value: "noShow", label: "Không đi" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "holding", label: "Giữ chỗ" },
  { value: "expired", label: "Hết hạn" },
];

export const DON_DAT_TAB_VIEW: Record<
  Exclude<DonDatTab, "all">,
  BookingViewStatus
> = {
  booked: "BOOKED",
  pickedUp: "PICKED_UP",
  completed: "COMPLETED",
  noShow: "NO_SHOW",
  cancelled: "CANCELLED",
  holding: "HOLDING",
  expired: "EXPIRED",
};

/* Map ngược BookingViewStatus → tab, dùng khi đọc deep link ?viewStatus=... */
export const DON_DAT_VIEW_TAB: Record<BookingViewStatus, DonDatTab> = {
  BOOKED: "booked",
  PICKED_UP: "pickedUp",
  COMPLETED: "completed",
  NO_SHOW: "noShow",
  CANCELLED: "cancelled",
  HOLDING: "holding",
  EXPIRED: "expired",
};

/* Kiểm tra một chuỗi có phải BookingViewStatus hợp lệ từ query string không. */
export function laViewStatus(value: string): value is BookingViewStatus {
  return Object.hasOwn(DON_DAT_VIEW_TAB, value);
}

/* Nhãn + lớp badge cho trạng thái chung của đơn. */
export const DON_DAT_STATUS: Record<
  BookingViewStatus,
  { label: string; badge: string }
> = {
  BOOKED: { label: "Đã đặt", badge: "badge--sky" },
  PICKED_UP: { label: "Đã đón", badge: "badge--orange" },
  COMPLETED: { label: "Hoàn thành", badge: "badge--green" },
  NO_SHOW: { label: "Không đi", badge: "badge--red" },
  CANCELLED: { label: "Đã hủy", badge: "badge--slate" },
  HOLDING: { label: "Giữ chỗ", badge: "badge--orange" },
  EXPIRED: { label: "Hết hạn", badge: "badge--slate" },
};

/* Nhãn trạng thái đón/trả hành khách trên chuyến. */
export const PASSENGER_TRIP_STATUS: Record<PassengerTripStatus, string> = {
  WAITING_PICKUP: "Chờ đón",
  PICKED_UP: "Đã đón",
  DROPPED_OFF: "Đã trả",
  NO_SHOW: "Không đi",
};

export const SO_DONG_MOI_TRANG = 10;

/* Số ký tự tối đa của lý do hủy đơn (ràng buộc backend). */
export const LY_DO_HUY_MAX = 500;

/* Định dạng tiền theo tiền tệ của đơn (mặc định VND → hậu tố "đ"). */
export function formatTien(value: number, currency = "VND"): string {
  const amount = value.toLocaleString("vi-VN");
  return currency === "VND" ? `${amount}đ` : `${amount} ${currency}`;
}
