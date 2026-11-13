export type TaiXeTrangThai = "active" | "locked";

/* Hạng giấy phép lái xe hợp lệ (khớp backend). */
export const GPLX_HANG_OPTIONS = ["B1", "B2", "C1", "C", "D1", "D2", "E"] as const;
export type GplxHang = (typeof GPLX_HANG_OPTIONS)[number];

/* View-model một tài xế dùng ở màn Quản lý tài xế. */
export type TaiXe = {
  id: string;
  ten: string;
  soDienThoai: string;
  email: string;
  /* Số GPLX đã nhóm để hiển thị (vd. "0123 4567 8901"). */
  gplx: string;
  /* Số GPLX thô 12 chữ số dùng khi mở form sửa. */
  gplxRaw: string;
  hangGplx: string;
  /* Hạn GPLX dạng ISO yyyy-mm-dd (giá trị thô cho form sửa). */
  hanGplx: string;
  trips30Days: number;
  trangThai: TaiXeTrangThai;
  /* Ghi chú kèm theo lần khóa/mở khóa gần nhất (backend trả về, có thể rỗng). */
  statusNote: string;
  ngayTao: string;
};

export type TaiXeFormValues = {
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseClass: GplxHang;
  licenseExpiresOn: string;
};

export const TRANG_THAI_TAI_XE_LABEL: Record<TaiXeTrangThai, string> = {
  active: "Đang hoạt động",
  locked: "Bị khóa",
};

export const TRANG_THAI_TAI_XE_OPTIONS: { value: TaiXeTrangThai; label: string }[] =
  [
    { value: "active", label: "Đang hoạt động" },
    { value: "locked", label: "Bị khóa" },
  ];

/* Cửa sổ cảnh báo GPLX sắp hết hạn (ngày). */
const GPLX_WARNING_DAYS = 45;
const DAY_MS = 24 * 60 * 60 * 1000;

export function vietTatHoTen(ten: string): string {
  return ten
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

/* Nhóm 12 chữ số GPLX thành 3 nhóm 4 để dễ đọc. */
export function nhomGplx(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/* Định dạng mốc ISO thành dd/mm/yyyy; trả "—" khi thiếu/không hợp lệ. */
export function formatNgay(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

/* Số ngày còn lại tới hạn GPLX; âm nghĩa là đã quá hạn. */
export function soNgayConLai(hanIso: string): number {
  const han = new Date(`${hanIso}T00:00:00`);
  if (Number.isNaN(han.getTime())) return Number.NaN;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((han.getTime() - today.getTime()) / DAY_MS);
}

/* GPLX sắp hết hạn khi còn trong cửa sổ cảnh báo và chưa quá hạn. */
export function laSapHetHan(hanIso: string): boolean {
  const left = soNgayConLai(hanIso);
  return !Number.isNaN(left) && left >= 0 && left <= GPLX_WARNING_DAYS;
}

/* GPLX đã quá hạn (số ngày còn lại âm). */
export function daHetHan(hanIso: string): boolean {
  const left = soNgayConLai(hanIso);
  return !Number.isNaN(left) && left < 0;
}
