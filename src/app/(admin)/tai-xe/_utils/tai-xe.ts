import type { CompanyDriverStatus } from "@/api/tai-xe/api/types";

/* View-model trạng thái tài khoản tài xế dùng ở màn Quản lý tài xế. */
export type TaiXeTrangThai = "active" | "locked";

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

export const TRANG_THAI_TAI_XE_LABEL: Record<TaiXeTrangThai, string> = {
  active: "Đang hoạt động",
  locked: "Bị khóa",
};

/* Lựa chọn lọc theo trạng thái; value khớp thẳng API, không suy diễn từ nhãn. */
export const TRANG_THAI_TAI_XE_OPTIONS: {
  value: CompanyDriverStatus;
  label: string;
}[] = [
  { value: "ACTIVE", label: TRANG_THAI_TAI_XE_LABEL.active },
  { value: "LOCKED", label: TRANG_THAI_TAI_XE_LABEL.locked },
];

/* Cửa sổ cảnh báo GPLX sắp hết hạn (ngày). */
const GPLX_WARNING_DAYS = 45;
const DAY_MS = 24 * 60 * 60 * 1000;

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
