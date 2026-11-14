import type {
  CompanyCustomerDetailResponse,
  CompanyCustomerResponse,
} from "@/api/khach-hang/api/types";
import type { TicketResponse } from "@/api/booking/types";
import { routeLabel } from "@/utils/route-label";

import type { KhachHang, TrangThaiVe, VeDaDat } from "../_data/customers";

/* Định dạng mốc ISO thành dd/mm/yyyy; trả "—" khi thiếu/không hợp lệ. */
function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
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
    ten: customer.fullName,
    soDienThoai: customer.phone,
    email: customer.email,
    /* Danh sách chỉ trả mốc đặt vé gần nhất, không có ngày tạo tài khoản. */
    datGanNhat: formatDate(customer.lastBookingAt),
    ngayTaoTaiKhoan: null,
    /* bookingCount là số đơn đã đặt — cùng nghĩa với chi tiết. */
    veDaDat: customer.bookingCount,
    tongChiTieu: 0,
    trangThai: customer.accountStatus,
    lichSuVe: [],
  };
}

export function mapCustomers(customers: CompanyCustomerResponse[]): KhachHang[] {
  return customers.map(mapCustomer);
}

/* Chi tiết chỉ bổ sung các trường riêng, giữ nguyên mốc đặt gần nhất từ danh sách. */
export type KhachHangDetail = Omit<KhachHang, "datGanNhat">;

/* Đọc mốc ISO thành mili-giây; null khi thiếu/không hợp lệ. */
function docThoiDiem(value: string | null): number | null {
  if (!value) return null;
  const moc = new Date(value).getTime();
  return Number.isNaN(moc) ? null : moc;
}

/* Sắp xếp giảm dần theo thời gian; mốc thiếu/không hợp lệ xuống cuối. */
function soSanhGiamDan(a: string | null, b: string | null): number {
  const mocA = docThoiDiem(a);
  const mocB = docThoiDiem(b);
  if (mocA === null && mocB === null) return 0;
  if (mocA === null) return 1;
  if (mocB === null) return -1;
  return mocB - mocA;
}

/* Chi tiết khách (kèm lịch sử booking) → view-model đầy đủ. */
export function mapCustomerDetail(
  detail: CompanyCustomerDetailResponse
): KhachHangDetail {
  /* Lịch sử vé sắp theo giờ khởi hành giảm dần (vé mới nhất lên đầu). */
  const lichSuVe: VeDaDat[] = detail.bookings
    .flatMap((booking) =>
      booking.tickets.map((ticket) => ({
        departureAt: booking.trip.departureAt,
        ve: {
          maVe: ticket.ticketCode,
          tuyen: routeLabel(
            booking.trip.originAreaName,
            booking.trip.destinationAreaName
          ),
          thoiGian: formatDate(booking.trip.departureAt),
          /* "Đã thu tiền" lấy từ cờ paymentCollected của vé, không suy từ trạng thái. */
          daThuTien: ticket.paymentCollected === true,
          ghe: ticket.seatCode,
          trangThai: mapVeTrangThai(ticket),
        } satisfies VeDaDat,
      }))
    )
    .sort((a, b) => soSanhGiamDan(a.departureAt, b.departureAt))
    .map((item) => item.ve);

  const tongChiTieu = detail.bookings
    .filter((booking) => booking.status === "CONFIRMED")
    .reduce((sum, booking) => sum + booking.quotedTotalAmount, 0);

  return {
    id: detail.id,
    ten: detail.fullName,
    soDienThoai: detail.phone,
    email: detail.email,
    /* Ngày tạo tài khoản chỉ lấy từ createdAt của chi tiết. */
    ngayTaoTaiKhoan: formatDate(detail.createdAt),
    /* Số đơn đã đặt — nhất quán với bookingCount ở danh sách. */
    veDaDat: detail.bookings.length,
    tongChiTieu,
    trangThai: detail.accountStatus,
    lichSuVe,
  };
}
