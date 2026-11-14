export type XeTrangThai = "Đang hoạt động" | "Đang bảo trì" | "Ngưng sử dụng";

export type Xe = {
  id: string;
  bienSo: string;
  loaiXe: string;
  soCho: number;
  seatLayoutId: string | null;
  trangThai: XeTrangThai;
};

export type XeFormValues = {
  bienSo: string;
  loaiXe: string;
  soCho: number;
  trangThai: XeTrangThai;
};

export const XE_TRANG_THAI_OPTIONS: XeTrangThai[] = [
  "Đang hoạt động",
  "Đang bảo trì",
  "Ngưng sử dụng",
];
