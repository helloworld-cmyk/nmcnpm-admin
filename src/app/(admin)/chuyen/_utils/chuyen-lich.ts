import {
  LICH_DAY_FROM,
  LICH_DAY_TO,
  gioSangPhut,
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
  id: string;
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

/* Nhịp chia lưới giờ trên trục thời gian (1 giờ = 60 phút) → mỗi giờ một ô. */
export const LICH_STEP = 60;

/* Khung giờ hiển thị của lịch: mặc định 05:00–23:00, tự nới sớm hơn theo
   bội số của LICH_STEP nếu trong ngày có chuyến khởi hành trước 05:00, để khối
   chuyến không tràn khỏi lưới (mốc giờ sinh theo đúng nhịp lưới). */
export type LichWindow = {
  from: number;
  to: number;
  hours: string[];
};

export function buildLichWindow(dayTrips: ChuyenRecord[]): LichWindow {
  let from = LICH_DAY_FROM;
  dayTrips.forEach((trip) => {
    const start = gioSangPhut(trip.gio);
    if (start < from) from = start;
  });
  if (from < LICH_DAY_FROM) {
    from = Math.max(
      0,
      LICH_DAY_FROM -
        Math.ceil((LICH_DAY_FROM - from) / LICH_STEP) * LICH_STEP
    );
  }
  const to = from + Math.ceil((LICH_DAY_TO - from) / LICH_STEP) * LICH_STEP;
  const hours: string[] = [];
  for (let phut = from; phut < to; phut += LICH_STEP) {
    hours.push(phutSangGio(phut));
  }
  return { from, to, hours };
}

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

/* Vị trí % của khối chuyến trên trục thời gian của làn (kẹp trong [0, 100]
   để chuyến ngoài khung giờ không tràn khỏi lưới). */
export function viTriKhoi(
  gio: string,
  thoiLuong: number,
  window: LichWindow
) {
  const start = gioSangPhut(gio);
  const dur = thoiLuong || 90;
  const span = window.to - window.from;
  const left = Math.max(
    0,
    Math.min(((start - window.from) / span) * 100, 100)
  );
  const width = Math.max(0, Math.min((dur / span) * 100, 100 - left));
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
  width: number,
  window: LichWindow
): string | null {
  if (!width) return null;
  const span = window.to - window.from;
  const ratio = (clientX - left) / width;
  const phut = window.from + Math.round((ratio * span) / 30) * 30;
  return phutSangGio(Math.max(window.from, Math.min(phut, window.to - 30)));
}

export function buildLaneViews(
  mode: LaneMode,
  xeOptions: XeOption[],
  taixeOptions: TaiXeOption[],
  dayTrips: ChuyenRecord[],
  window: LichWindow
): LaneView[] {
  return buildLanes(mode, xeOptions, taixeOptions).map((lane) => {
    const list = tripsTheoLan(dayTrips, lane, mode);
    return {
      ...lane,
      metaLabel: metaLan(lane, list),
      trips: list.map((trip) => {
        const { left, width } = viTriKhoi(trip.gio, trip.thoiLuong, window);
        return {
          id: trip.id,
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
