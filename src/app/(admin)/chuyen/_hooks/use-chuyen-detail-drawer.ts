"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  LENH_CHUA_PHAN_CONG,
  LENH_HIENTHI,
  TRANG_THAI_HIENTHI,
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
  buildChuyenTimeline,
  lenhStepsFor,
  mapHistoryTimeline,
  seatBarVariant,
  ticketFlagBadges,
  type StepState,
  type TimelineItem,
  type TicketFlag,
} from "../_utils/chuyen-detail";
import { lenhTuTrangThaiPhanCong } from "../_utils/map-trip";
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
 * View-model của ngăn kéo chi tiết chuyến: gộp chi tiết chuyến từ backend
 * (`GET /trips/{id}` — vé, phân công, số ghế, lịch sử, cờ thao tác) với chuyến
 * đang mở để component chỉ còn render. Ref nút đóng do hook quản lý để tự focus
 * khi mở chuyến khác.
 */
export function useChuyenDetailDrawer(trip: ChuyenRecord | null) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const focusedIdRef = useRef<string | null>(null);

  const tripId = trip?.id ?? "";
  const {
    detail: tripDetail,
    veList,
    isLoading,
    isError,
    errorText,
    refetch,
  } = useChuyenDetail(tripId);

  useEffect(() => {
    if (!trip || focusedIdRef.current === trip.id) return;
    focusedIdRef.current = trip.id;
    closeBtnRef.current?.focus();
  }, [trip]);

  const detail = useMemo<ChuyenDetailView | null>(() => {
    if (!trip) return null;

    const assignment = tripDetail?.assignment ?? null;
    const seatSummary = tripDetail?.seats ?? null;

    const timeText = `${trip.gio} · ${isoSangNhanNgan(trip.ngayISO)} · ${isoSangNhanSub(trip.ngayISO)}`;
    /* assignment.active = false nghĩa là phân công đã bị từ chối/thay thế. */
    const activeAssignment = assignment?.active === false ? null : assignment;
    const driverName = activeAssignment?.driverName ?? null;
    const driverPhone = activeAssignment?.driverPhone ?? null;
    const vehiclePlate = activeAssignment?.plateNumber ?? null;
    const vehicleSub = activeAssignment?.vehicleModel
      ? `${activeAssignment.vehicleModel} · ${activeAssignment.passengerCapacity ?? trip.sucChua} chỗ`
      : null;
    const hasAssignment = Boolean(driverName && vehiclePlate);
    const sucChua = seatSummary?.totalSeats ?? trip.sucChua;
    const daDat = seatSummary?.occupiedSeats ?? veList.filter((ve) => !ve.daHuy).length;
    const tyLe =
      seatSummary != null
        ? Math.round(seatSummary.occupancyRate)
        : sucChua > 0
          ? Math.round((daDat / sucChua) * 100)
          : 0;

    const hienThi = TRANG_THAI_HIENTHI[trip.trangThai];
    const lenh = activeAssignment
      ? lenhTuTrangThaiPhanCong(activeAssignment.assignmentStatus)
      : null;
    const lenhInfo = driverName
      ? lenh
        ? LENH_HIENTHI[lenh]
        : null
      : LENH_CHUA_PHAN_CONG;
    const steps = lenhStepsFor(driverName ? lenh : null, trip.trangThai);
    /* Cờ thao tác lấy trực tiếp từ backend thay vì suy diễn ở client. */
    const actions = tripDetail?.actions ?? null;
    const canEdit = actions?.canEdit ?? false;
    const canAssign = actions?.canAssign ?? false;
    const canCancel = actions?.canCancel ?? false;
    const canDelete = coTheXoa(trip);
    const history = tripDetail?.history ?? [];
    const timeline =
      history.length > 0
        ? mapHistoryTimeline(history)
        : buildChuyenTimeline(trip, {
            driverName,
            vehiclePlate,
            hasAssignment,
            timeText,
          });

    return {
      timeText,
      hienThi,
      daDat,
      sucChua,
      tyLe,
      seatVariant: seatBarVariant(trip.trangThai, tyLe),
      giaVeText: dinhDangTien(tripDetail?.baseFareAmount ?? trip.giaVe),
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
      /* Backend chi tiết chuyến chưa trả mức trễ và sự cố theo chuyến. */
      treText: null,
      sucoState: null,
      timeline,
      footNote: FOOT_NOTE[trip.trangThai],
      veList: veList.map((ve) => ({ ...ve, flags: ticketFlagBadges(ve) })),
    };
  }, [trip, tripDetail, veList]);

  return {
    detail,
    isLoading,
    isError,
    errorText,
    refetch,
    closeBtnRef,
  };
}
