"use client";

import { useCallback, useMemo, useState, type MouseEvent } from "react";
import {
  homNayISO,
  type ChuyenLichPrefill,
  type ChuyenRecord,
  type TaiXeOption,
  type XeOption,
} from "../_data/chuyen";
import {
  buildLaneViews,
  buildLichWindow,
  gioTuViTriTrack,
  prefillTheoLan,
  type LaneMode,
  type LaneView,
} from "../_utils/chuyen-lich";

/* Mốc "hôm nay" cố định theo lần tải màn — giữ nguyên hành vi lịch hiện tại. */
const NGAY_HIEN_TAI = homNayISO();

type UseChuyenLichOptions = {
  trips: ChuyenRecord[];
  xeOptions: XeOption[];
  taixeOptions: TaiXeOption[];
  onCreate: (prefill: ChuyenLichPrefill) => void;
};

/*
 * Toàn bộ state + nghiệp vụ của lịch điều phối (chọn ngày, nhóm tài nguyên,
 * dựng làn + khối chuyến, suy giờ từ vị trí bấm). Component `ChuyenLich` chỉ render.
 */
export function useChuyenLich({
  trips,
  xeOptions,
  taixeOptions,
  onCreate,
}: UseChuyenLichOptions) {
  const [ngayISO, setNgayISO] = useState(NGAY_HIEN_TAI);
  const [mode, setMode] = useState<LaneMode>("taixe");

  const dayTrips = useMemo(
    () => trips.filter((trip) => trip.ngayISO === ngayISO),
    [trips, ngayISO]
  );

  const lichWindow = useMemo(() => buildLichWindow(dayTrips), [dayTrips]);

  const lanes = useMemo(
    () => buildLaneViews(mode, xeOptions, taixeOptions, dayTrips, lichWindow),
    [mode, xeOptions, taixeOptions, dayTrips, lichWindow]
  );

  const setNgay = useCallback((iso: string) => {
    if (!iso) return;
    setNgayISO(iso);
  }, []);

  const createFor = useCallback(
    (lane: LaneView) => onCreate(prefillTheoLan(lane, mode, ngayISO)),
    [onCreate, mode, ngayISO]
  );

  const handleTrackClick = useCallback(
    (event: MouseEvent<HTMLDivElement>, lane: LaneView) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const gio = gioTuViTriTrack(
        event.clientX,
        rect.left,
        rect.width,
        lichWindow
      );
      if (!gio) return;
      onCreate({ ...prefillTheoLan(lane, mode, ngayISO), gio });
    },
    [onCreate, mode, ngayISO, lichWindow]
  );

  return {
    ngayISO,
    mode,
    hasTrips: dayTrips.length > 0,
    lanes,
    lichWindow,
    setMode,
    setNgay,
    createFor,
    handleTrackClick,
  };
}
