export type TrangThaiTaiKhoan = "active" | "locked";
export type HangThanhVien = "Đồng" | "Bạc" | "Vàng" | "Kim cương";
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
  maKhach: string;
  ten: string;
  soDienThoai: string;
  email: string;
  ngayTao: string;
  veDaDat: number;
  tongChiTieu: number;
  hangThanhVien: HangThanhVien;
  trangThai: TrangThaiTaiKhoan;
  lyDoKhoa: string | null;
  lichSuVe: VeDaDat[];
};

export const KH_LY_DO_KHOA_OPTIONS = [
  "Nghi ngờ gian lận đặt vé",
  "Khách yêu cầu khóa tài khoản",
  "Thông tin tài khoản không hợp lệ",
  "Khác",
] as const;

export const TRANG_THAI_TAI_KHOAN_LABEL: Record<TrangThaiTaiKhoan, string> = {
  active: "Đang hoạt động",
  locked: "Bị khóa",
};

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

export function soSanhNgay(a: string, b: string): number {
  const [ngayA, thangA, namA] = a.split("/").map(Number);
  const [ngayB, thangB, namB] = b.split("/").map(Number);
  return namA - namB || thangA - thangB || ngayA - ngayB;
}

export function formatVnd(value: number): string {
  return `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ₫`;
}
