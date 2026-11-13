import type {
  CompanyCustomerDetailResponse,
  CompanyCustomerResponse,
} from "@/api/khach-hang/api/types";
import type { TicketResponse } from "@/api/booking/types";

import type { HangThanhVien, KhachHang, TrangThaiVe, VeDaDat } from "../_data/customers";

/* accountStatus của backend → trạng thái 2 mức đang dùng ở UI. */
function mapTrangThai(accountStatus: CompanyCustomerResponse["accountStatus"]): KhachHang["trangThai"] {
  return accountStatus === "ACTIVE" ? "active" : "locked";
}

/* Định dạng mốc ISO thành dd/mm/yyyy; trả "—" khi thiếu/không hợp lệ. */
function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

/* Mã khách hiển thị — backend chưa trả mã riêng nên suy ra ổn định từ id. */
function maKhach(id: string): string {
  return `KH-${id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`;
}

/*
 * Hạng thành viên — backend chưa trả hạng nên suy ra tạm từ số vé đã đặt
 * để giữ đúng bố cục hiển thị.
 */
function hangThanhVien(bookingCount: number): HangThanhVien {
  if (bookingCount >= 20) return "Kim cương";
  if (bookingCount >= 12) return "Vàng";
  if (bookingCount >= 5) return "Bạc";
  return "Đồng";
}

/* Trạng thái vé (đặt vé + đón/trả hành khách) → nhãn trạng thái vé ở UI. */
function mapVeTrangThai(ticket: TicketResponse): TrangThaiVe {
  if (ticket.status === "CANCELLED" || ticket.status === "EXPIRED") return "Đã hủy";
  if (ticket.passengerTripStatus === "NO_SHOW") return "Không lên xe";
  if (ticket.passengerTripStatus === "DROPPED_OFF") return "Hoàn thành";
  if (ticket.passengerTripStatus === "PICKED_UP") return "Đã đón";
  return "Đã đặt";
}

/* Danh sách khách hàng rút gọn → view-model bảng. */
export function mapCustomer(customer: CompanyCustomerResponse): KhachHang {
  return {
    id: customer.id,
    maKhach: maKhach(customer.id),
    ten: customer.fullName,
    soDienThoai: customer.phone,
    email: customer.email,
    /* Danh sách chỉ có mốc đặt vé gần nhất, dùng tạm cho cột thời gian. */
    ngayTao: formatDate(customer.lastBookingAt),
    veDaDat: customer.bookingCount,
    tongChiTieu: 0,
    hangThanhVien: hangThanhVien(customer.bookingCount),
    trangThai: mapTrangThai(customer.accountStatus),
    lyDoKhoa: null,
    lichSuVe: [],
  };
}

export function mapCustomers(customers: CompanyCustomerResponse[]): KhachHang[] {
  return customers.map(mapCustomer);
}

/* Chi tiết khách (kèm lịch sử booking) → view-model đầy đủ. */
export function mapCustomerDetail(
  detail: CompanyCustomerDetailResponse
): KhachHang {
  const lichSuVe: VeDaDat[] = detail.bookings.flatMap((booking) =>
    booking.tickets.map((ticket) => ({
      maVe: ticket.ticketCode,
      tuyen: booking.trip.routeName,
      thoiGian: formatDate(booking.trip.departureAt),
      daThuTien: ticket.status === "CONFIRMED",
      ghe: ticket.seatCode,
      trangThai: mapVeTrangThai(ticket),
    }))
  );

  const tongChiTieu = detail.bookings
    .filter((booking) => booking.status === "CONFIRMED")
    .reduce((sum, booking) => sum + booking.quotedTotalAmount, 0);

  return {
    id: detail.id,
    maKhach: maKhach(detail.id),
    ten: detail.fullName,
    soDienThoai: detail.phone,
    email: detail.email,
    ngayTao: formatDate(detail.createdAt),
    veDaDat: detail.bookings.length,
    tongChiTieu,
    hangThanhVien: hangThanhVien(detail.bookings.length),
    trangThai: mapTrangThai(detail.accountStatus),
    lyDoKhoa: null,
    lichSuVe,
  };
}
