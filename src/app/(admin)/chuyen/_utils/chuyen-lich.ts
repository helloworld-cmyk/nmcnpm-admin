import {
  LICH_DAY_FROM,
  LICH_DAY_TO,
  gioSangPhut,
  ngaySangISO,
  phutSangGio,
  vietTat,
  type ChuyenLichPrefill,
  type ChuyenRecord,
  type TaiXeOption,
  type TrangThaiChuyen,
  type XeOption,
} from "../_data/chuyen";

export type LaneMode = "taixe" | "xe";

/* Một "làn" tài nguyên trên lịch: 1 tài xế, 1 xe, hoặc các làn sentinel chưa gán. */
export type LaneResource = {
  id: string;
  name: string;
  meta: string;
  none?: boolean;
};

/* Chuyến đã tính sẵn vị trí + nhãn để component chỉ việc render. */
export type LaneTrip = {
  ma: string;
  tuyenNgan: string;
  trangThai: TrangThaiChuyen;
  title: string;
  left: number;
  width: number;
};

/* Làn + dữ liệu hiển thị đã tổng hợp (meta đã ghép, chuyến đã định vị). */
export type LaneView = LaneResource & {
  metaLabel: string;
  trips: LaneTrip[];
};

export const LICH_SPAN = LICH_DAY_TO - LICH_DAY_FROM;

const NONE_DRIVER: LaneResource = {
  id: "chua-phan-cong",
  name: "Chưa phân công",
  meta: "Cần gán tài xế + xe",
};

const NONE_VEHICLE: LaneResource = {
  id: "chua-gan-xe",
  name: "Chưa gán xe",
  meta: "Cần gán xe",
};

export const congNgay = (moc: Date, offset: number) => {
  const d = new Date(moc.getTime());
  d.setDate(d.getDate() + offset);
  return d;
};

export const ngayISOLech = (moc: Date, offset: number) =>
  ngaySangISO(congNgay(moc, offset));

export const tuyenNgan = (tuyen: string) => {
  const parts = tuyen.split("→").map((part) => part.trim());
  if (parts.length !== 2) return tuyen;
  return `${vietTat(parts[0])} → ${vietTat(parts[1])}`;
};

export function buildLanes(
  mode: LaneMode,
  xeOptions: XeOption[],
  taixeOptions: TaiXeOption[]
): LaneResource[] {
  if (mode === "xe") {
    return [
      ...xeOptions.map((option) => ({
        id: option.value,
        name: option.plateNumber,
        meta: `${option.capacity} chỗ`,
      })),
      NONE_VEHICLE,
    ];
  }
  return [
    ...taixeOptions.map((option) => ({
      id: option.value,
      name: option.name,
      meta: option.licenseClass,
    })),
    NONE_DRIVER,
  ];
}

export const tripsTheoLan = (
  dayTrips: ChuyenRecord[],
  lane: LaneResource,
  mode: LaneMode
) =>
  dayTrips.filter((trip) => {
    if (mode === "xe") {
      return lane.none ? !trip.xeId : trip.xeId === lane.id;
    }
    return lane.none ? !trip.taixeId : trip.taixeId === lane.id;
  });

export function metaLan(lane: LaneResource, list: ChuyenRecord[]) {
  if (lane.none) return lane.meta;
  if (!list.length) return `${lane.meta} · Rảnh cả ngày`;
  const starts = list.map((trip) => gioSangPhut(trip.gio));
  const ends = list.map((trip) => gioSangPhut(trip.gio) + (trip.thoiLuong || 90));
  return `${lane.meta} · Chạy ${phutSangGio(Math.min(...starts))}–${phutSangGio(Math.max(...ends))}`;
}

/* Vị trí % của khối chuyến trên trục thời gian của làn. */
export function viTriKhoi(gio: string, thoiLuong: number) {
  const start = gioSangPhut(gio);
  const dur = thoiLuong || 90;
  const left = ((start - LICH_DAY_FROM) / LICH_SPAN) * 100;
  const width = Math.min((dur / LICH_SPAN) * 100, 100 - left);
  return { left, width };
}

export function prefillTheoLan(
  lane: LaneResource,
  mode: LaneMode,
  ngayISO: string
): ChuyenLichPrefill {
  return {
    ngayISO,
    ...(lane.none ? {} : mode === "xe" ? { xe: lane.id } : { taixe: lane.id }),
  };
}

/* Giờ khởi hành (làm tròn 30') suy ra từ vị trí bấm trên trục thời gian. */
export function gioTuViTriTrack(
  clientX: number,
  left: number,
  width: number
): string | null {
  if (!width) return null;
  const ratio = (clientX - left) / width;
  const phut = LICH_DAY_FROM + Math.round((ratio * LICH_SPAN) / 30) * 30;
  return phutSangGio(Math.max(LICH_DAY_FROM, Math.min(phut, LICH_DAY_TO - 30)));
}

export function buildLaneViews(
  mode: LaneMode,
  xeOptions: XeOption[],
  taixeOptions: TaiXeOption[],
  dayTrips: ChuyenRecord[]
): LaneView[] {
  return buildLanes(mode, xeOptions, taixeOptions).map((lane) => {
    const list = tripsTheoLan(dayTrips, lane, mode);
    return {
      ...lane,
      metaLabel: metaLan(lane, list),
      trips: list.map((trip) => {
        const { left, width } = viTriKhoi(trip.gio, trip.thoiLuong);
        return {
          ma: trip.ma,
          tuyenNgan: tuyenNgan(trip.tuyen),
          trangThai: trip.trangThai,
          title: `${trip.ma} · ${trip.tuyen} · ${trip.gio}`,
          left,
          width,
        };
      }),
    };
  });
}
