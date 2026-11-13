/* Kiểu dữ liệu đặt vé và vé dùng chung cho nhiều domain (chuyến, khách hàng). */

/* Trạng thái đặt vé. */
export type BookingStatus = "HOLDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

/* Trạng thái vé. */
export type TicketStatus = "HOLDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";

/* Trạng thái đón/trả hành khách trên chuyến. */
export type PassengerTripStatus =
  | "WAITING_PICKUP"
  | "PICKED_UP"
  | "DROPPED_OFF"
  | "NO_SHOW";

/* Một vé (ghế) trong đặt vé. */
export type TicketResponse = {
  id: string;
  ticketCode: string;
  passengerName: string;
  passengerPhone: string;
  pickupAddress: string;
  dropoffAddress: string;
  seatId: string;
  seatCode: string;
  fareAmount: number;
  /* true khi tài xế đã xác nhận thu tiền; null khi chưa có dữ liệu thu tiền. */
  paymentCollected?: boolean | null;
  collectedAmount?: number | null;
  collectedAt?: string | null;
  collectedBy?: string | null;
  status: TicketStatus;
  passengerTripStatus: PassengerTripStatus;
  createdAt: string;
};
