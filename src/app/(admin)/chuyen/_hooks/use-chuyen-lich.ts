"use client";

import { useCallback, useMemo, useState, type MouseEvent } from "react";
import {
  isoSangNhanNgan,
  type ChuyenLichPrefill,
  type ChuyenRecord,
  type TaiXeOption,
  type XeOption,
} from "../_data/chuyen";
import {
  buildLaneViews,
  congNgay,
  gioTuViTriTrack,
  ngayISOLech,
  prefillTheoLan,
  type LaneMode,
  type LaneView,
} from "../_utils/chuyen-lich";

/* Mốc "hôm nay" cố định theo lần tải màn — giữ nguyên hành vi lịch hiện tại. */
const NGAY_HIEN_TAI = new Date();

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
  const [offset, setOffset] = useState(0);
  const [mode, setMode] = useState<LaneMode>("taixe");

  const ngayISO = useMemo(
    () => ngayISOLech(NGAY_HIEN_TAI, offset),
    [offset]
  );

  const dayTrips = useMemo(
    () => trips.filter((trip) => trip.ngayISO === ngayISO),
    [trips, ngayISO]
  );

  const lanes = useMemo(
    () => buildLaneViews(mode, xeOptions, taixeOptions, dayTrips),
    [mode, xeOptions, taixeOptions, dayTrips]
  );

  const dateLabel = `${isoSangNhanNgan(ngayISO)}/${congNgay(NGAY_HIEN_TAI, offset).getFullYear()}`;

  const goPrev = useCallback(() => setOffset((prev) => prev - 1), []);
  const goNext = useCallback(() => setOffset((prev) => prev + 1), []);

  const createFor = useCallback(
    (lane: LaneView) => onCreate(prefillTheoLan(lane, mode, ngayISO)),
    [onCreate, mode, ngayISO]
  );

  const handleTrackClick = useCallback(
    (event: MouseEvent<HTMLDivElement>, lane: LaneView) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const gio = gioTuViTriTrack(event.clientX, rect.left, rect.width);
      if (!gio) return;
      onCreate({ ...prefillTheoLan(lane, mode, ngayISO), gio });
    },
    [onCreate, mode, ngayISO]
  );

  return {
    offset,
    mode,
    dateLabel,
    hasTrips: dayTrips.length > 0,
    lanes,
    setMode,
    goPrev,
    goNext,
    createFor,
    handleTrackClick,
  };
}
