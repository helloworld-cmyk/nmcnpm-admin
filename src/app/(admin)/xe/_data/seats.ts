/* Hạng ghế và trạng thái trình cấu hình sơ đồ ghế của xe. */

export type SeatTone = "sky" | "orange" | "green" | "slate";

export type SeatClassOption = {
  value: string;
  label: string;
  tone: SeatTone;
};

/* Giá trị seatClass đặc biệt: ô trống (lối đi/khoảng trống) — không gửi lên API. */
export const SEAT_EMPTY = "EMPTY";

export const DEFAULT_SEAT_NAME = "Sơ đồ ghế mặc định";

/*
 * Hạng ghế gợi ý. Backend nhận seatClass là chuỗi tự do (<=30 ký tự, tự viết
 * hoa, mặc định "STANDARD") nên đây chỉ là bộ chọn nhanh ở UI.
 */
export const SEAT_CLASS_OPTIONS: SeatClassOption[] = [
  { value: "STANDARD", label: "Ghế thường", tone: "sky" },
  { value: "VIP", label: "Ghế VIP", tone: "orange" },
  { value: "SLEEPER", label: "Giường nằm", tone: "green" },
];

/* Giới hạn theo ràng buộc backend (ConfigureVehicleSeatsRequest) + tiện dụng UI. */
export const SEAT_LIMITS = {
  decks: { min: 1, max: 2 },
  rows: { min: 1, max: 20 },
  columns: { min: 1, max: 5 },
  nameMax: 120,
  seatsMax: 100,
  seatClassMax: 30,
  seatCodeMax: 20,
};

/* Mã ghế chỉ gồm chữ, số, gạch ngang/gạch dưới và tối đa 20 ký tự. */
export const SEAT_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

/* Xe đang được cấu hình sơ đồ ghế. */
export type XeSeatTarget = {
  vehicleId: string;
  bienSo: string;
  loaiXe: string;
};

/* Trạng thái trình cấu hình; `cells` khóa theo `${deck}-${row}-${col}` (1-based). */
export type XeSeatEditorState = {
  name: string;
  decks: number;
  rows: number;
  cols: number;
  cells: Record<string, string>;
};
