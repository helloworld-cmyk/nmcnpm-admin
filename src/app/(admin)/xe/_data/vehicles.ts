export type XeTrangThai = "Đang hoạt động" | "Đang bảo trì" | "Ngưng sử dụng";

export type Xe = {
  id: string;
  bienSo: string;
  loaiXe: string;
  soCho: number;
  taiXe: string | null;
  trangThai: XeTrangThai;
  dangKiem: string;
  baoHiem: string;
  daGanChuyen: boolean;
};

export type XeFormValues = {
  bienSo: string;
  loaiXe: string;
  soCho: number;
  taiXe: string | null;
  trangThai: XeTrangThai;
  dangKiem: string;
  baoHiem: string;
};

export const XE_DRIVERS = [
  "Nguyễn Văn Mạnh",
  "Trần Quốc Bảo",
  "Lê Thị Hồng",
  "Đỗ Trọng Khánh",
  "Phạm Đức Long",
  "Vũ Nhật Tân",
] as const;

export const XE_TRANG_THAI_OPTIONS: XeTrangThai[] = [
  "Đang hoạt động",
  "Đang bảo trì",
  "Ngưng sử dụng",
];

export const XE_SO_CHO_OPTIONS = [7, 9, 16, 22];

export const INITIAL_VEHICLES: Xe[] = [
  {
    id: "xe-01",
    bienSo: "29A-123.45",
    loaiXe: "Ford Transit 16 chỗ",
    soCho: 16,
    taiXe: "Nguyễn Văn Mạnh",
    trangThai: "Đang hoạt động",
    dangKiem: "2027-05-31",
    baoHiem: "2026-12-31",
    daGanChuyen: true,
  },
  {
    id: "xe-02",
    bienSo: "29A-456.78",
    loaiXe: "Hyundai Solati 16 chỗ",
    soCho: 16,
    taiXe: "Trần Quốc Bảo",
    trangThai: "Đang bảo trì",
    dangKiem: "2027-03-31",
    baoHiem: "2026-11-12",
    daGanChuyen: true,
  },
  {
    id: "xe-03",
    bienSo: "30K-888.99",
    loaiXe: "Toyota Hiace 9 chỗ",
    soCho: 9,
    taiXe: "Lê Thị Hồng",
    trangThai: "Đang hoạt động",
    dangKiem: "2027-08-31",
    baoHiem: "2027-06-30",
    daGanChuyen: true,
  },
  {
    id: "xe-04",
    bienSo: "51B-234.56",
    loaiXe: "Ford Transit 16 chỗ",
    soCho: 16,
    taiXe: null,
    trangThai: "Ngưng sử dụng",
    dangKiem: "2027-01-31",
    baoHiem: "2027-01-31",
    daGanChuyen: false,
  },
  {
    id: "xe-05",
    bienSo: "89H-111.22",
    loaiXe: "Limousine 22 chỗ",
    soCho: 22,
    taiXe: "Đỗ Trọng Khánh",
    trangThai: "Đang hoạt động",
    dangKiem: "2026-11-30",
    baoHiem: "2027-05-31",
    daGanChuyen: true,
  },
  {
    id: "xe-06",
    bienSo: "29C-777.88",
    loaiXe: "Hyundai Solati 16 chỗ",
    soCho: 16,
    taiXe: "Phạm Đức Long",
    trangThai: "Đang hoạt động",
    dangKiem: "2027-09-30",
    baoHiem: "2027-09-30",
    daGanChuyen: true,
  },
  {
    id: "xe-07",
    bienSo: "29H-512.36",
    loaiXe: "Solati Limousine 9 chỗ",
    soCho: 9,
    taiXe: "Vũ Nhật Tân",
    trangThai: "Đang hoạt động",
    dangKiem: "2027-05-31",
    baoHiem: "2027-04-30",
    daGanChuyen: true,
  },
  {
    id: "xe-08",
    bienSo: "30K-246.88",
    loaiXe: "Toyota Fortuner 7 chỗ",
    soCho: 7,
    taiXe: null,
    trangThai: "Đang hoạt động",
    dangKiem: "2027-02-28",
    baoHiem: "2027-08-31",
    daGanChuyen: false,
  },
  {
    id: "xe-09",
    bienSo: "51K-365.47",
    loaiXe: "Ford Transit 16 chỗ",
    soCho: 16,
    taiXe: "Nguyễn Văn Mạnh",
    trangThai: "Đang hoạt động",
    dangKiem: "2026-12-06",
    baoHiem: "2027-03-31",
    daGanChuyen: true,
  },
  {
    id: "xe-10",
    bienSo: "88B-909.10",
    loaiXe: "Limousine 22 chỗ",
    soCho: 22,
    taiXe: "Đỗ Trọng Khánh",
    trangThai: "Đang bảo trì",
    dangKiem: "2027-06-30",
    baoHiem: "2027-01-31",
    daGanChuyen: false,
  },
  {
    id: "xe-11",
    bienSo: "30K-771.23",
    loaiXe: "Hyundai Solati 16 chỗ",
    soCho: 16,
    taiXe: "Trần Quốc Bảo",
    trangThai: "Ngưng sử dụng",
    dangKiem: "2026-10-15",
    baoHiem: "2027-10-31",
    daGanChuyen: false,
  },
  {
    id: "xe-12",
    bienSo: "29C-654.01",
    loaiXe: "Solati Limousine 9 chỗ",
    soCho: 9,
    taiXe: "Lê Thị Hồng",
    trangThai: "Đang hoạt động",
    dangKiem: "2027-07-31",
    baoHiem: "2027-02-28",
    daGanChuyen: true,
  },
  {
    id: "xe-13",
    bienSo: "51B-118.66",
    loaiXe: "Toyota Hiace 9 chỗ",
    soCho: 9,
    taiXe: "Phạm Đức Long",
    trangThai: "Đang hoạt động",
    dangKiem: "2027-04-30",
    baoHiem: "2026-12-20",
    daGanChuyen: true,
  },
  {
    id: "xe-14",
    bienSo: "89H-808.55",
    loaiXe: "Ford Transit 16 chỗ",
    soCho: 16,
    taiXe: null,
    trangThai: "Ngưng sử dụng",
    dangKiem: "2027-03-31",
    baoHiem: "2027-03-31",
    daGanChuyen: false,
  },
];

const WARNING_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;

export function isDocExpiringSoon(hetHan: string) {
  const time = new Date(`${hetHan}T00:00:00`).getTime();
  return time - Date.now() <= WARNING_WINDOW_MS;
}

export function formatDocDate(hetHan: string, warning: boolean) {
  const date = new Date(`${hetHan}T00:00:00`);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return warning
    ? `${day}/${month}/${date.getFullYear()}`
    : `${month}/${date.getFullYear()}`;
}
