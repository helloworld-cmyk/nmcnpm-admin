export type XeTrangThai = "Đang hoạt động" | "Đang bảo trì" | "Ngưng sử dụng";

export type Xe = {
  id: string;
  bienSo: string;
  loaiXe: string;
  soCho: number;
  /* id tài xế phụ trách (CompanyDriverResponse.driverId) — backend chưa có nguồn, chỉ lưu cục bộ. */
  taiXeId: string | null;
  taiXe: string | null;
  trangThai: XeTrangThai;
  daGanChuyen: boolean;
};

export type XeFormValues = {
  bienSo: string;
  loaiXe: string;
  soCho: number;
  taiXeId: string | null;
  trangThai: XeTrangThai;
};

/* Lựa chọn tài xế lấy từ API /bus-companies/{id}/drivers; value = driverId. */
export type XeDriverOption = { value: string; label: string; name: string };

export const XE_TRANG_THAI_OPTIONS: XeTrangThai[] = [
  "Đang hoạt động",
  "Đang bảo trì",
  "Ngưng sử dụng",
];

export const XE_SO_CHO_OPTIONS = [7, 9, 16, 22];
