/* Hằng số và state trình cấu hình sơ đồ ghế một tầng của xe. */

/*
 * Sơ đồ ghế một tầng, không phân hạng ghế (theo ConfigureVehicleSeatsRequest).
 * Mỗi ô chỉ có hai trạng thái: có ghế hoặc ô trống (lối đi/khoảng trống).
 */
export const SEAT_FILLED = "SEAT";

/* Ô trống (lối đi/khoảng trống) — không gửi lên API. */
export const SEAT_EMPTY = "EMPTY";

export const DEFAULT_SEAT_NAME = "Sơ đồ ghế mặc định";

/* Giới hạn theo ràng buộc backend (ConfigureVehicleSeatsRequest) + tiện dụng UI. */
export const SEAT_LIMITS = {
  rows: { min: 1, max: 20 },
  columns: { min: 1, max: 5 },
  nameMax: 120,
  seatsMax: 100,
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

/* Trạng thái trình cấu hình; `cells` khóa theo `${row}-${col}` (1-based). */
export type XeSeatEditorState = {
  name: string;
  rows: number;
  cols: number;
  cells: Record<string, string>;
};
