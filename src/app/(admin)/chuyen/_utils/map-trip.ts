import type { PassengerTripStatus } from "@/api/booking/types";
import type {
  DriverAssignmentStatus,
  TripAssignmentResponse,
  TripDetailPassenger,
  TripResponse,
} from "@/api/chuyen/api/types";
import type { VehicleResponse } from "@/api/xe/api/types";
import { routeLabel } from "@/utils/route-label";

import {
  type ChuyenRecord,
  type LenhPhanCong,
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

/* Mốc hủy chuyến (ISO) → "dd/mm · HH:mm"; trả null khi chuyến chưa bị hủy. */
const mocHuy = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} · ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

/*
 * TripResponse → ChuyenRecord (view-model tiếng Việt của màn Quản lý chuyến).
 * Backend /bus-companies/{id}/trips hiện KHÔNG trả: tài xế, xe, số ghế đã đặt,
 * sự cố, mức trễ → mapTrip dùng giá trị an toàn (null/0), sau đó hook màn chuyến
 * ghép tài xế/xe (/assignments) và số ghế đã đặt (/bookings) vào danh sách
 * (xem use-chuyen-board.ts).
 */
export function mapTrip(trip: TripResponse): ChuyenRecord {
  const { ngayISO, gio } = ngayGioDiaPhuong(trip.departureAt);
  return {
    id: trip.id,
    ma: trip.tripCode,
    ngayISO,
    gio,
    tuyenId: trip.routeId,
    tuyen: routeLabel(trip.originAreaName, trip.destinationAreaName),
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
    trangThai: STATUS_TO_TRANG_THAI[trip.status],
    trangThaiBackend: trip.status,
    salesStatus: trip.salesStatus,
    daKhoiHanh: trip.actualDepartureAt !== null,
    lenh: null,
    thoiLuong: thoiLuongPhut(trip.departureAt, trip.expectedArrivalAt),
    huyLuc: mocHuy(trip.cancelledAt),
    lyDoHuy: trip.cancellationReason,
    moTaHuy: trip.cancellationDescription,
    taoLuc: mocTao(trip.createdAt),
  };
}

export function mapTrips(trips: TripResponse[]): ChuyenRecord[] {
  return trips.map(mapTrip);
}

/* Trạng thái phân công của backend → trạng thái "lệnh" hiển thị trên bảng chuyến. */
const LENH_THEO_TRANG_THAI: Record<
  DriverAssignmentStatus,
  LenhPhanCong | null
> = {
  ASSIGNED: "chua-nhan",
  ACCEPTED: "da-nhan",
  PREPARING: "da-nhan",
  ARRIVED: "co-mat",
  COMPLETED: "co-mat",
  REJECTED: null,
  REPLACED: null,
};

export function lenhTuTrangThaiPhanCong(
  status: DriverAssignmentStatus | null | undefined
): LenhPhanCong | null {
  return status ? LENH_THEO_TRANG_THAI[status] : null;
}

/*
 * Ghép phân công xe + tài xế (và trạng thái nhận lệnh) vào chuyến.
 * Phân công REJECTED/REPLACED được backend coi như chưa phân công.
 */
export function applyTripAssignment(
  trip: ChuyenRecord,
  assignment: TripAssignmentResponse,
  vehicle: VehicleResponse | undefined,
  assignmentStatus: DriverAssignmentStatus | undefined
): ChuyenRecord {
  if (!assignment.driverId || !assignment.driverName) return trip;
  if (assignmentStatus === "REJECTED" || assignmentStatus === "REPLACED") {
    return trip;
  }

  return {
    ...trip,
    taixeId: assignment.driverId,
    taixe: assignment.driverName,
    xeId: assignment.vehicleId,
    xeBienSo: vehicle?.plateNumber ?? null,
    xeLoai: vehicle
      ? `${vehicle.vehicleModel} · ${vehicle.passengerCapacity} chỗ`
      : null,
    sucChua: vehicle?.passengerCapacity ?? trip.sucChua,
    lenh: lenhTuTrangThaiPhanCong(assignmentStatus) ?? "chua-nhan",
  };
}

/*
 * Backend dùng java.time.LocalDateTime nên chỉ nhận "yyyy-mm-ddTHH:mm:ss"
 * (giờ địa phương, KHÔNG kèm Z/offset). Dùng toISOString() sẽ quy đổi sang UTC
 * và lệch múi giờ (01:00 → 18:00 hôm trước), nên phải format tay.
 */
const localDateTime = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

/* Ghép ngày (yyyy-mm-dd) + giờ (HH:mm) của form thành LocalDateTime gửi backend. */
export function buildDepartureAt(ngayISO: string, gio: string) {
  const [y, m, d] = ngayISO.split("-").map(Number);
  const [h, mi] = gio.split(":").map(Number);
  return localDateTime(new Date(y, m - 1, d, h, mi, 0, 0));
}

/* Cộng thời lượng tuyến (phút) vào mốc khởi hành để có giờ đến dự kiến. */
export function buildExpectedArrivalAt(departureAt: string, minutes: number) {
  return localDateTime(
    new Date(new Date(departureAt).getTime() + Math.max(0, minutes) * 60000)
  );
}

/* Một vé chỉ "đã đón" khi hành khách đã lên (hoặc đã xuống) xe. */
const DA_DON: readonly PassengerTripStatus[] = ["PICKED_UP", "DROPPED_OFF"];

/*
 * Vé trong chi tiết chuyến (TripDetailResponse.passengers) → danh sách vé hiển
 * thị. Vé đã hủy/hết hạn coi như đã hủy; "đã thu" lấy từ paymentCollected.
 */
export function mapDetailPassengers(
  passengers: TripDetailPassenger[]
): VeItem[] {
  return passengers.map((ticket) => ({
    id: ticket.id,
    maVe: ticket.ticketCode,
    khach: ticket.passengerName,
    sdt: ticket.passengerPhone || ticket.contactPhone,
    ghe: ticket.seatCode,
    diemDon: ticket.pickupAddress || "—",
    diemTra: ticket.dropoffAddress || "—",
    tien: ticket.fareAmount,
    daDon: DA_DON.includes(ticket.passengerTripStatus),
    daThu: ticket.paymentCollected === true,
    daHuy: ticket.status === "CANCELLED" || ticket.status === "EXPIRED",
  }));
}
