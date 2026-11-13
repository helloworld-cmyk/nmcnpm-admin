import type { PassengerTripStatus } from "@/api/booking/types";
import type {
  CompanyBookingResponse,
  CompanyBookingSummaryResponse,
} from "@/api/don-dat/api/types";
import { routeLabel } from "@/utils/route-label";

const pad2 = (value: number) => String(value).padStart(2, "0");

/* Mốc ISO → "dd/mm · HH:mm" theo giờ địa phương; "—" khi thiếu/không hợp lệ. */
export function mocThoiGian(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)} · ${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}`;
}

/* Một dòng đơn đặt trong bảng quản lý toàn hãng. */
export type DonDatRow = {
  id: string;
  ma: string;
  khach: string;
  sdt: string;
  chuyen: string;
  tuyen: string;
  khoiHanh: string;
  soVe: number;
  ghe: string;
  tien: number;
  currency: string;
  trangThai: CompanyBookingSummaryResponse["viewStatus"];
  passengerTripStatus: CompanyBookingSummaryResponse["passengerTripStatus"];
  holdExpiresAt: string | null;
};

/* CompanyBookingSummaryResponse → dòng bảng. */
export function mapBookingRow(
  booking: CompanyBookingSummaryResponse
): DonDatRow {
  return {
    id: booking.id,
    ma: booking.bookingCode,
    khach: booking.contactName,
    sdt: booking.contactPhone,
    chuyen: booking.tripCode,
    tuyen: routeLabel(booking.originAreaName, booking.destinationAreaName),
    khoiHanh: mocThoiGian(booking.departureAt),
    soVe: booking.ticketCount,
    ghe: booking.seatCodes.join(", "),
    tien: booking.quotedTotalAmount,
    currency: booking.currency,
    trangThai: booking.viewStatus,
    passengerTripStatus: booking.passengerTripStatus,
    holdExpiresAt: booking.holdExpiresAt,
  };
}

/* Một vé/hành khách trong chi tiết đơn. */
export type DonDatTicket = {
  id: string;
  maVe: string;
  khach: string;
  sdt: string;
  ghe: string;
  diemDon: string;
  diemTra: string;
  tien: number;
  trangThai: string;
  passengerTripStatus: PassengerTripStatus;
};

/* Chi tiết đơn đã map sẵn để component chỉ việc render. */
export type DonDatDetail = {
  id: string;
  ma: string;
  trangThai: CompanyBookingResponse["viewStatus"];
  passengerTripStatus: CompanyBookingResponse["passengerTripStatus"];
  khach: string;
  sdt: string;
  email: string;
  pickupAddress: string;
  dropoffAddress: string;
  tien: number;
  currency: string;
  chuyen: {
    ma: string;
    tuyen: string;
    khoiHanh: string;
    denDuKien: string;
    trangThai: string;
    hotline: string;
  };
  phanCong: {
    taiXe: string;
    sdtTaiXe: string;
    bienSo: string;
    loaiXe: string;
  } | null;
  tickets: DonDatTicket[];
  history: {
    eventType: string;
    title: string | null;
    occurredAt: string;
    description: string | null;
    done: boolean;
  }[];
  lyDoHuy: string | null;
  huyLuc: string | null;
  taoLuc: string;
};

/* CompanyBookingResponse → chi tiết đơn. */
export function mapBookingDetail(
  booking: CompanyBookingResponse
): DonDatDetail {
  return {
    id: booking.id,
    ma: booking.bookingCode,
    trangThai: booking.viewStatus,
    passengerTripStatus: booking.passengerTripStatus,
    khach: booking.contactName,
    sdt: booking.contactPhone,
    email: booking.contactEmail || "—",
    pickupAddress: booking.pickupAddress || "—",
    dropoffAddress: booking.dropoffAddress || "—",
    tien: booking.quotedTotalAmount,
    currency: booking.currency,
    chuyen: {
      ma: booking.trip.tripCode,
      tuyen: routeLabel(
        booking.trip.originAreaName,
        booking.trip.destinationAreaName
      ),
      khoiHanh: mocThoiGian(booking.trip.departureAt),
      denDuKien: mocThoiGian(booking.trip.expectedArrivalAt),
      trangThai: booking.trip.status,
      hotline: booking.trip.companyHotline,
    },
    phanCong: booking.assignment
      ? {
          taiXe: booking.assignment.driverName,
          sdtTaiXe: booking.assignment.driverPhone,
          bienSo: booking.assignment.plateNumber,
          loaiXe: `${booking.assignment.vehicleModel} · ${booking.assignment.passengerCapacity} chỗ`,
        }
      : null,
    tickets: booking.tickets.map((ticket) => ({
      id: ticket.id,
      maVe: ticket.ticketCode,
      khach: ticket.passengerName,
      sdt: ticket.passengerPhone || booking.contactPhone,
      ghe: ticket.seatCode,
      diemDon: ticket.pickupAddress || "—",
      diemTra: ticket.dropoffAddress || "—",
      tien: ticket.fareAmount,
      trangThai: ticket.status,
      passengerTripStatus: ticket.passengerTripStatus,
    })),
    history: booking.history.map((item) => ({
      eventType: item.eventType,
      title: item.title,
      occurredAt: mocThoiGian(item.occurredAt),
      description: item.description,
      done: item.state === "DONE",
    })),
    lyDoHuy: booking.cancellationReason,
    huyLuc: booking.cancelledAt ? mocThoiGian(booking.cancelledAt) : null,
    taoLuc: mocThoiGian(booking.createdAt),
  };
}
