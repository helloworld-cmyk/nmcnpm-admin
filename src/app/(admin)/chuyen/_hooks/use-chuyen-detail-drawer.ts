"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  LENH_CHUA_PHAN_CONG,
  LENH_HIENTHI,
  TRANG_THAI_HIENTHI,
  coTheHuy,
  coThePhanCong,
  coTheSua,
  coTheXoa,
  dinhDangTien,
  isoSangNhanNgan,
  isoSangNhanSub,
  vietTat,
  type ChuyenRecord,
  type VeItem,
} from "../_data/chuyen";
import {
  FOOT_NOTE,
  SUCO_STATE,
  buildChuyenTimeline,
  lenhStepsFor,
  seatBarVariant,
  ticketFlagBadges,
  type StepState,
  type TimelineItem,
  type TicketFlag,
} from "../_utils/chuyen-detail";
import { useChuyenDetail } from "./use-chuyen-detail";

export type ChuyenVeView = VeItem & { flags: TicketFlag[] };

export type ChuyenDetailView = {
  timeText: string;
  hienThi: { label: string; badgeClass: string };
  daDat: number;
  sucChua: number;
  tyLe: number;
  seatVariant: string;
  giaVeText: string;
  driverName: string | null;
  driverPhone: string | null;
  driverInitial: string;
  vehiclePlate: string | null;
  vehicleSub: string | null;
  hasAssignment: boolean;
  lenhInfo: {
    label: string;
    icon: string;
    badgeClass: string;
    sub: string;
  } | null;
  steps: Record<string, StepState>;
  canEdit: boolean;
  canAssign: boolean;
  canCancel: boolean;
  canDelete: boolean;
  treText: string | null;
  sucoState: { title: string; chip: string; chipClass: string } | null;
  timeline: TimelineItem[];
  footNote: string;
  veList: ChuyenVeView[];
};

/*
 * View-model của ngăn kéo chi tiết chuyến: gộp dữ liệu chi tiết (vé, phân công) với
 * chuyến đang mở để component chỉ còn render. Ref nút đóng do hook quản lý để tự
 * focus khi mở chuyến khác.
 */
export function useChuyenDetailDrawer(trip: ChuyenRecord | null) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const focusedMaRef = useRef<string | null>(null);

  const {
    veList,
    assignment,
    vehicle,
    isLoading,
    isError,
    errorText,
    refetch,
  } = useChuyenDetail(trip);

  useEffect(() => {
    if (!trip || focusedMaRef.current === trip.ma) return;
    focusedMaRef.current = trip.ma;
    closeBtnRef.current?.focus();
  }, [trip]);

  const detail = useMemo<ChuyenDetailView | null>(() => {
    if (!trip) return null;

    const timeText = `${trip.gio} · ${isoSangNhanNgan(trip.ngayISO)} · ${isoSangNhanSub(trip.ngayISO)}`;
    const driverName = assignment?.driverName ?? trip.taixe ?? null;
    const driverPhone = assignment?.driverPhone ?? null;
    const vehiclePlate = vehicle?.plateNumber ?? trip.xeBienSo ?? null;
    const vehicleSub = vehicle
      ? `${vehicle.vehicleModel} · ${vehicle.passengerCapacity} chỗ`
      : (trip.xeLoai ?? null);
    const hasAssignment = Boolean(driverName && vehiclePlate);
    const sucChua = vehicle?.passengerCapacity ?? trip.sucChua;
    const daDat = veList.filter((ve) => !ve.daHuy).length;
    const tyLe = sucChua > 0 ? Math.round((daDat / sucChua) * 100) : 0;

    const hienThi = TRANG_THAI_HIENTHI[trip.trangThai];
    const lenhInfo = driverName
      ? trip.lenh
        ? LENH_HIENTHI[trip.lenh]
        : null
      : LENH_CHUA_PHAN_CONG;
    const steps = lenhStepsFor(driverName ? trip.lenh : null, trip.trangThai);
    const canEdit = coTheSua(trip);
    const canAssign = coThePhanCong(trip);
    const canCancel = coTheHuy(trip);
    const canDelete = coTheXoa(trip);
    const treText = trip.tre
      ? trip.trangThai === "dang-thuc-hien"
        ? `Chuyến đang trễ ${trip.tre} phút so với kế hoạch hành trình.`
        : `Chuyến trễ ${trip.tre} phút so với giờ khởi hành dự kiến.`
      : null;

    return {
      timeText,
      hienThi,
      daDat,
      sucChua,
      tyLe,
      seatVariant: seatBarVariant(trip.trangThai, tyLe),
      giaVeText: dinhDangTien(trip.giaVe),
      driverName,
      driverPhone,
      driverInitial: driverName ? vietTat(driverName) : "?",
      vehiclePlate,
      vehicleSub,
      hasAssignment,
      lenhInfo,
      steps,
      canEdit,
      canAssign,
      canCancel,
      canDelete,
      treText,
      sucoState: trip.suco ? SUCO_STATE[trip.suco.trangThai] : null,
      timeline: buildChuyenTimeline(trip, {
        driverName,
        vehiclePlate,
        hasAssignment,
        timeText,
      }),
      footNote: FOOT_NOTE[trip.trangThai],
      veList: veList.map((ve) => ({ ...ve, flags: ticketFlagBadges(ve) })),
    };
  }, [trip, veList, assignment, vehicle]);

  return {
    detail,
    isLoading,
    isError,
    errorText,
    refetch,
    closeBtnRef,
  };
}
