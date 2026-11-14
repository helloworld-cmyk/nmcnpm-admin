import type { UserAccountStatus } from "@/api/khach-hang/api/types";

/* Trạng thái tài khoản dùng đúng enum của backend. */
export type TrangThaiTaiKhoan = UserAccountStatus;

export type TrangThaiVe =
  | "Hoàn thành"
  | "Đã hủy"
  | "Không lên xe"
  | "Đã đặt"
  | "Đã đón";

export type VeDaDat = {
  maVe: string;
  tuyen: string;
  thoiGian: string;
  daThuTien: boolean;
  ghe: string;
  trangThai: TrangThaiVe;
};

export type KhachHang = {
  id: string;
  ten: string;
  soDienThoai: string;
  email: string;
  /* Mốc đặt vé gần nhất (lastBookingAt của danh sách). */
  datGanNhat: string;
  /* Ngày tạo tài khoản (createdAt của chi tiết); null khi chi tiết chưa tải. */
  ngayTaoTaiKhoan: string | null;
  /* Số đơn đã đặt (bookingCount) — nhất quán giữa danh sách và chi tiết. */
  veDaDat: number;
  tongChiTieu: number;
  trangThai: TrangThaiTaiKhoan;
  lichSuVe: VeDaDat[];
};

export const TRANG_THAI_TAI_KHOAN_LABEL: Record<TrangThaiTaiKhoan, string> = {
  ACTIVE: "Đang hoạt động",
  PENDING: "Chờ kích hoạt",
  SUSPENDED: "Tạm khóa",
  CLOSED: "Đã đóng",
};

export const TRANG_THAI_TAI_KHOAN_BADGE: Record<TrangThaiTaiKhoan, string> = {
  ACTIVE: "badge--green",
  PENDING: "badge--sky",
  SUSPENDED: "badge--orange",
  CLOSED: "badge--slate",
};

/* Tùy chọn lọc theo accountStatus của backend. */
export const TRANG_THAI_TAI_KHOAN_OPTIONS: {
  value: TrangThaiTaiKhoan;
  label: string;
}[] = [
  { value: "ACTIVE", label: TRANG_THAI_TAI_KHOAN_LABEL.ACTIVE },
  { value: "PENDING", label: TRANG_THAI_TAI_KHOAN_LABEL.PENDING },
  { value: "SUSPENDED", label: TRANG_THAI_TAI_KHOAN_LABEL.SUSPENDED },
  { value: "CLOSED", label: TRANG_THAI_TAI_KHOAN_LABEL.CLOSED },
];

/* Tài khoản không còn đăng nhập/đặt vé được (mọi trạng thái khác ACTIVE). */
export function laTaiKhoanBiKhoa(trangThai: TrangThaiTaiKhoan): boolean {
  return trangThai !== "ACTIVE";
}

export const VE_TRANG_THAI_BADGE: Record<TrangThaiVe, string> = {
  "Hoàn thành": "badge--green",
  "Đã hủy": "badge--orange",
  "Không lên xe": "badge--orange",
  "Đã đặt": "badge--orange",
  "Đã đón": "badge--sky",
};

export function vietTatHoTen(ten: string): string {
  return ten
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

/* Đọc mốc dd/mm/yyyy thành số mili-giây; null khi thiếu/không hợp lệ. */
function docMocNgay(value: string): number | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const ngay = Number(match[1]);
  const thang = Number(match[2]);
  const nam = Number(match[3]);
  const moc = new Date(nam, thang - 1, ngay).getTime();
  return Number.isNaN(moc) ? null : moc;
}

export function coNgay(value: string): boolean {
  return docMocNgay(value) !== null;
}

/* So sánh hai mốc dd/mm/yyyy; trả 0 thay vì NaN khi thiếu ngày để giữ thứ tự ổn định. */
export function soSanhNgay(a: string, b: string): number {
  const mocA = docMocNgay(a);
  const mocB = docMocNgay(b);
  if (mocA === null && mocB === null) return 0;
  if (mocA === null) return 1;
  if (mocB === null) return -1;
  return mocA - mocB;
}

export function formatVnd(value: number): string {
  return `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;
}
