import {
  LICH_DAY_FROM,
  LICH_DAY_TO,
  gioSangPhut,
  phutSangGio,
  type ChuyenRecord,
} from "../_data/chuyen";

export type BusyInterval = [number, number];

export const pct = (phut: number) =>
  Math.max(
    0,
    Math.min(
      100,
      ((phut - LICH_DAY_FROM) / (LICH_DAY_TO - LICH_DAY_FROM)) * 100
    )
  );

export const overlaps = (
  interval: BusyInterval,
  start: number | null,
  end: number | null
) => start !== null && end !== null && interval[0] < end && interval[1] > start;

export function buildBusyMap(
  trips: ChuyenRecord[],
  ngayISO: string,
  excludeId: string | null,
  field: "xe" | "tx"
) {
  const map = new Map<string, BusyInterval[]>();
  trips.forEach((trip) => {
    if (trip.ngayISO !== ngayISO || trip.id === excludeId) return;
    const key = field === "xe" ? trip.xeId : trip.taixeId;
    if (!key) return;
    const start = gioSangPhut(trip.gio);
    const end = start + (trip.thoiLuong || 90);
    map.set(key, [...(map.get(key) ?? []), [start, end]]);
  });
  return map;
}

export const busyCua = (map: Map<string, BusyInterval[]>, key: string) =>
  (key && map.get(key)) || [];

export const busyLabel = (busy: BusyInterval[]) =>
  busy.length
    ? `Bận ${busy
        .map((it) => `${phutSangGio(it[0])}–${phutSangGio(it[1])}`)
        .join(", ")}`
    : "Rảnh cả ngày";