import type { TripSalesStatus, TripStatus } from "@/api/chuyen/api/types";

export type TrangThaiChuyen =
  | "sap-toi"
  | "dang-thuc-hien"
  | "hoan-thanh"
  | "da-huy";

export type LenhPhanCong = "chua-nhan" | "da-nhan" | "co-mat";

export type SucoTrangThai = "mo" | "dang-xu-ly" | "da-xu-ly";

export type SuCo = {
  moTa: string;
  loai: string;
  baoLuc: string;
  trangThai: SucoTrangThai;
  nguoiXuLy?: string;
  bienPhap?: string;
  bienPhapThuc?: string;
  ketQua?: string;
  dongLuc?: string;
};

export type ChuyenRecord = {
  /* id chuyến từ backend (TripResponse.id) — dùng cho mutation create/update/publish.
     Các thao tác backend chưa hỗ trợ (hủy, sự cố, phân công) chỉ lưu cục bộ theo id này. */
  id: string;
  ma: string;
  ngayISO: string;
  gio: string;
  tuyenId: string;
  tuyen: string;
  taixeId: string | null;
  taixe: string | null;
  /* id xe từ backend (VehicleResponse.id) — dùng cho select + API phân công. */
  xeId: string | null;
  xeBienSo: string | null;
  xeLoai: string | null;
  soChoMo: number;
  sucChua: number;
  daDat: number;
  giaVe: number;
  trangThai: TrangThaiChuyen;
  /* Trạng thái vận hành gốc của backend (DRAFT/SCHEDULED/IN_PROGRESS/...) —
     nguồn sự thật thay cho việc suy đoán từ nhãn UI. */
  trangThaiBackend: TripStatus;
  /* Trạng thái mở bán của backend (CLOSED/OPEN/PAUSED). */
  salesStatus: TripSalesStatus;
  /* Chuyến đã thực sự khởi hành (TripResponse.actualDepartureAt ≠ null). */
  daKhoiHanh: boolean;
  lenh: LenhPhanCong | null;
  /* Thời lượng tuyến (phút), suy ra từ departureAt → expectedArrivalAt của backend. */
  thoiLuong: number;
  /* Thông tin hủy chuyến do hãng thực hiện (backend TripResponse.cancellation*). */
  huyLuc: string | null;
  lyDoHuy: string | null;
  moTaHuy: string | null;
  tre?: number;
  suco?: SuCo | null;
  ghiChu?: string;
  taoLuc: string;
};

/* Một vé (ghế) của chuyến — dựng từ danh sách đặt vé của chuyến. */
export type VeItem = {
  id: string;
  maVe: string;
  khach: string;
  sdt: string;
  ghe: string;
  diemDon: string;
  diemTra: string;
  tien: number;
  daDon: boolean;
  daThu: boolean;
  daHuy: boolean;
};

export const SO_DONG_MOI_TRANG = 7;

export const TRANG_THAI_OPTIONS: {
  value: TrangThaiChuyen | "all";
  label: string;
}[] = [
  { value: "all", label: "Tất cả" },
  { value: "sap-toi", label: "Sắp tới" },
  { value: "dang-thuc-hien", label: "Đang thực hiện" },
  { value: "hoan-thanh", label: "Hoàn thành" },
  { value: "da-huy", label: "Đã hủy" },
];

/* Giá trị sentinel cho bộ lọc tài xế (không phải id thật). */
export const TAIXE_FILTER_ALL = "all";
export const TAIXE_FILTER_UNASSIGNED = "chua-phan-cong";

/* Lựa chọn xe/tài xế lấy từ API /vehicles và /drivers; value = id backend. */
export type XeOption = {
  value: string;
  label: string;
  plateNumber: string;
  model: string;
  capacity: number;
};
export type TaiXeOption = {
  value: string;
  label: string;
  name: string;
  licenseClass: string;
};

/* Prefill khi mở form tạo chuyến từ màn lịch (chọn trước ngày/giờ/xe/tài xế). */
export type ChuyenLichPrefill = {
  ngayISO?: string;
  gio?: string;
  xe?: string;
  taixe?: string;
};

export type ChuyenFormTarget =
  | { mode: "create"; prefill?: ChuyenLichPrefill }
  | { mode: "edit"; trip: ChuyenRecord };

/* Tuyến lấy từ API /bus-companies/{id}/routes — value = routeId thật. */
export type ChuyenTuyenOption = { value: string; label: string };

export const LY_DO_HUY = [
  { value: "thoi-tiet", label: "Thời tiết xấu" },
  { value: "xe-hong", label: "Xe sự cố, không kịp thay" },
  { value: "dieu-hanh", label: "Yêu cầu điều hành" },
  { value: "khac", label: "Lý do khác" },
];

export const NGUOI_XU_LY_OPTIONS = [
  "Admin trực ca",
  "Điều hành Trần Hùng",
  "Điều hành Lê Mai",
];

export const BIEN_PHAP_OPTIONS: { value: string; label: string }[] = [
  { value: "Tiep tuc", label: "Tiếp tục chạy" },
  { value: "Thay xe", label: "Thay xe" },
  { value: "Doi tai xe", label: "Đổi tài xế" },
  { value: "Ket thuc som", label: "Kết thúc sớm" },
  { value: "Khac", label: "Khác" },
];

export const bienPhapLabel = (value?: string) =>
  BIEN_PHAP_OPTIONS.find((item) => item.value === value)?.label ?? "Đang xử lý";

export const LICH_DAY_FROM = 5 * 60;
export const LICH_DAY_TO = 23 * 60;

const chuCaiDau = (ten: string) =>
  ten
    .split(" ")
    .map((tu) => tu.charAt(0).toUpperCase())
    .join("");

export const vietTat = chuCaiDau;

export const dinhDangTien = (value: number) =>
  `${value.toLocaleString("vi-VN")}đ`;

export const gioSangPhut = (gio: string) => {
  const [h, m] = gio.split(":").map(Number);
  return h * 60 + m;
};

export const phutSangGio = (phut: number) => {
  const giaTri = ((phut % 1440) + 1440) % 1440;
  const h = String(Math.floor(giaTri / 60)).padStart(2, "0");
  const m = String(giaTri % 60).padStart(2, "0");
  return `${h}:${m}`;
};

export const ngaySangISO = (ngay: Date) => {
  const y = ngay.getFullYear();
  const m = String(ngay.getMonth() + 1).padStart(2, "0");
  const d = String(ngay.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const homNayISO = () => ngaySangISO(new Date());

/* Số ngày lệch giữa ngayISO (yyyy-mm-dd) và hôm nay (âm: quá khứ, dương: tương lai). */
export const lechNgay = (ngayISO: string) => {
  const [y, m, d] = ngayISO.split("-").map(Number);
  if (!y || !m || !d) return Number.NaN;
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const moc = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - moc.getTime()) / 86400000);
};

export const isoSangNhanSub = (ngayISO: string) => {
  const lech = lechNgay(ngayISO);
  if (lech === 0) return "Hôm nay";
  if (lech === 1) return "Ngày mai";
  if (lech === -1) return "Hôm qua";
  const [, m, d] = ngayISO.split("-");
  return `Ngày ${d}/${m}`;
};

export const isoSangNhanNgan = (ngayISO: string) => {
  const [, m, d] = ngayISO.split("-");
  return `${d}/${m}`;
};

/* Mốc khởi hành (ngày ISO + giờ HH:mm) theo giờ địa phương. */
export const mocKhoiHanh = (ngayISO: string, gio: string) => {
  const [y, m, d] = ngayISO.split("-").map(Number);
  const [h, mi] = gio.split(":").map(Number);
  return new Date(y, m - 1, d, h, mi, 0, 0);
};

/* Chuyến chưa tới giờ khởi hành — chỉ chuyến như vậy mới còn công bố mở bán. */
export const chuaKhoiHanh = (trip: ChuyenRecord) =>
  mocKhoiHanh(trip.ngayISO, trip.gio).getTime() > Date.now();

/*
 * Các điều kiện thao tác suy trực tiếp từ điều kiện backend
 * (TripServiceImpl) để UI không lệch nguồn sự thật:
 * - update / publish / delete: DRAFT + salesStatus CLOSED;
 * - cancel: DRAFT/SCHEDULED và chưa khởi hành thực tế;
 * - assign: mọi chuyến chưa kết thúc/hủy.
 */

/* Chuyến nháp chưa công bố (backend: DRAFT + CLOSED). */
export const laChuyenNhap = (trip: ChuyenRecord) =>
  trip.trangThaiBackend === "DRAFT" && trip.salesStatus === "CLOSED";

/* Sửa lịch chuyến — backend updateTrip chỉ cho chuyến nháp. */
export const coTheSua = laChuyenNhap;

/* Công bố mở bán — backend publishTrip chỉ cho chuyến nháp còn hạn chót đặt vé. */
export const coTheCongBo = laChuyenNhap;

/* Hủy chuyến — backend cancelTrip cho chuyến chưa thực sự khởi hành. */
export const coTheHuy = (trip: ChuyenRecord) =>
  (trip.trangThaiBackend === "DRAFT" ||
    trip.trangThaiBackend === "SCHEDULED") &&
  !trip.daKhoiHanh;

/* Xóa chuyến nháp — backend deleteTrip chỉ cho chuyến nháp chưa khởi hành. */
export const coTheXoa = (trip: ChuyenRecord) =>
  laChuyenNhap(trip) && !trip.daKhoiHanh;

/* Phân công/đổi xe & tài xế — backend assignTrip chặn chuyến đã kết thúc/hủy. */
export const coThePhanCong = (trip: ChuyenRecord) =>
  trip.trangThaiBackend !== "COMPLETED" &&
  trip.trangThaiBackend !== "CANCELLED" &&
  trip.trangThaiBackend !== "TERMINATED";

export const taoMaChuyen = (trips: ChuyenRecord[]) => {
  const maxSo = trips.reduce((so, trip) => {
    const match = trip.ma.match(/VC-(\d+)/);
    return match ? Math.max(so, Number(match[1])) : so;
  }, 1000);
  return `VC-${maxSo + 1}`;
};

export const tyLeLapGhe = (trip: ChuyenRecord) =>
  trip.sucChua > 0 ? Math.round((trip.daDat / trip.sucChua) * 100) : 0;

export const TRANG_THAI_HIENTHI: Record<
  TrangThaiChuyen,
  { label: string; badgeClass: string }
> = {
  "sap-toi": { label: "Sắp tới", badgeClass: "badge--sky" },
  "dang-thuc-hien": { label: "Đang thực hiện", badgeClass: "badge--orange" },
  "hoan-thanh": { label: "Hoàn thành", badgeClass: "badge--green" },
  "da-huy": { label: "Đã hủy", badgeClass: "badge--slate" },
};

export const LENH_HIENTHI: Record<
  LenhPhanCong,
  { label: string; icon: string; badgeClass: string; sub: string }
> = {
  "chua-nhan": {
    label: "Chưa nhận lệnh",
    icon: "i-alert",
    badgeClass: "badge--orange",
    sub: "Admin đã phân công, tài xế chưa xác nhận nhận lệnh.",
  },
  "da-nhan": {
    label: "Đã nhận lệnh",
    icon: "i-check",
    badgeClass: "badge--sky",
    sub: "Tài xế đã xác nhận lệnh, đang chuẩn bị cho chuyến.",
  },
  "co-mat": {
    label: "Đã có mặt tại bến",
    icon: "i-pin",
    badgeClass: "badge--green",
    sub: "Tài xế đã có mặt tại điểm xuất bến, sẵn sàng khởi hành.",
  },
};

export const LENH_CHUA_PHAN_CONG = {
  label: "Chưa phân công",
  icon: "i-alert",
  badgeClass: "badge--slate",
  sub: "Cần phân công tài xế trước khi gửi lệnh.",
};

export const gioHienTai = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
};

export const mocThoiGianHienTai = () => {
  const d = new Date();
  const gio = gioHienTai();
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")} · ${gio}`;
};
