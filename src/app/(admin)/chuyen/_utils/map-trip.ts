import type { PassengerTripStatus } from "@/api/booking/types";
import type {
  TripAssignmentResponse,
  TripPassengerBookingResponse,
  TripResponse,
} from "@/api/chuyen/api/types";

import {
  isoSangNhan,
  type ChuyenRecord,
  type TrangThaiChuyen,
  type VeItem,
} from "../_data/chuyen";

/* Ánh xạ trạng thái vận hành của backend sang nhãn trạng thái dùng ở UI. */
const STATUS_TO_TRANG_THAI: Record<TripResponse["status"], TrangThaiChuyen> = {
  DRAFT: "sap-toi",
  SCHEDULED: "sap-toi",
  IN_PROGRESS: "dang-thuc-hien",
  COMPLETED: "hoan-thanh",
  CANCELLED: "da-huy",
  TERMINATED: "da-huy",
};

const pad2 = (value: number) => String(value).padStart(2, "0");

/* Tách ngày (yyyy-mm-dd) và giờ (HH:mm) theo giờ địa phương từ mốc ISO của backend. */
const ngayGioDiaPhuong = (iso: string) => {
  const d = new Date(iso);
  return {
    ngayISO: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    gio: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
};

/* Thời lượng chuyến (phút) = expectedArrivalAt - departureAt. */
const thoiLuongPhut = (departureAt: string, expectedArrivalAt: string) => {
  const start = new Date(departureAt).getTime();
  const end = new Date(expectedArrivalAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / 60000);
};

const mocTao = (createdAt: string) => {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

/*
 * TripResponse → ChuyenRecord (view-model tiếng Việt của màn Quản lý chuyến).
 * Backend /bus-companies/{id}/trips hiện KHÔNG trả: tài xế, xe, số ghế mở/đã đặt,
 * công tài xế, sự cố, mức trễ → các trường này dùng giá trị an toàn (null/0) và
 * chỉ được cập nhật cục bộ ở tầng UI (xem local override trong chuyen-board.tsx).
 */
export function mapTrip(trip: TripResponse): ChuyenRecord {
  const { ngayISO, gio } = ngayGioDiaPhuong(trip.departureAt);
  return {
    id: trip.id,
    ma: trip.tripCode,
    ngayKey: isoSangNhan(ngayISO),
    ngayISO,
    gio,
    tuyenId: trip.routeId,
    tuyen: trip.routeName,
    tuyenPhu: `BX ${trip.originAreaName} → BX ${trip.destinationAreaName}`,
    /* Không có nguồn dữ liệu ở backend — giữ an toàn, cập nhật cục bộ khi cần. */
    taixeId: null,
    taixe: null,
    xeId: null,
    xeBienSo: null,
    xeLoai: null,
    soChoMo: 0,
    sucChua: 0,
    daDat: 0,
    giaVe: trip.baseFareAmount,
    congTaiXe: 0,
    trangThai: STATUS_TO_TRANG_THAI[trip.status],
    lenh: null,
    thoiLuong: thoiLuongPhut(trip.departureAt, trip.expectedArrivalAt),
    taoLuc: mocTao(trip.createdAt),
  };
}

export function mapTrips(trips: TripResponse[]): ChuyenRecord[] {
  return trips.map(mapTrip);
}

/* Ghép ngày (yyyy-mm-dd) + giờ (HH:mm) của form thành mốc ISO gửi backend. */
export function buildDepartureAt(ngayISO: string, gio: string) {
  const [y, m, d] = ngayISO.split("-").map(Number);
  const [h, mi] = gio.split(":").map(Number);
  return new Date(y, m - 1, d, h, mi, 0, 0).toISOString();
}

/* Cộng thời lượng tuyến (phút) vào mốc khởi hành để có giờ đến dự kiến. */
export function buildExpectedArrivalAt(departureAt: string, minutes: number) {
  return new Date(
    new Date(departureAt).getTime() + Math.max(0, minutes) * 60000
  ).toISOString();
}

/* Một vé chỉ "đã đón" khi hành khách đã lên (hoặc đã xuống) xe. */
const DA_DON: readonly PassengerTripStatus[] = ["PICKED_UP", "DROPPED_OFF"];

/*
 * Danh sách đặt vé + hành khách của chuyến → danh sách vé hiển thị trong ngăn
 * chi tiết. Vé CONFIRMED coi như đã thu; CANCELLED/EXPIRED coi như đã hủy.
 */
export function mapTripBookings(
  bookings: TripPassengerBookingResponse[]
): VeItem[] {
  return bookings.flatMap((booking) =>
    booking.passengers.map((ticket) => ({
      id: ticket.id,
      maVe: ticket.ticketCode,
      khach: ticket.passengerName,
      sdt: ticket.passengerPhone || booking.contactPhone,
      ghe: ticket.seatCode,
      diemDon: ticket.pickupAddress || "—",
      diemTra: ticket.dropoffAddress || "—",
      tien: ticket.fareAmount,
      daDon: DA_DON.includes(ticket.passengerTripStatus),
      daThu: ticket.status === "CONFIRMED",
      daHuy: ticket.status === "CANCELLED" || ticket.status === "EXPIRED",
    }))
  );
}

export type ChuyenAssignment = {
  driverName: string | null;
  driverPhone: string | null;
  vehicleId: string | null;
};

/* Phân công xe + tài xế hiện tại của chuyến (null khi chuyến chưa phân công). */
export function mapTripAssignment(
  assignment: TripAssignmentResponse | undefined
): ChuyenAssignment | null {
  if (!assignment) return null;
  if (!assignment.driverId && !assignment.vehicleId) return null;
  return {
    driverName: assignment.driverName,
    driverPhone: assignment.driverPhone,
    vehicleId: assignment.vehicleId,
  };
}
