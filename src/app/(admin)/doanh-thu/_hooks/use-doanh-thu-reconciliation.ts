"use client";

import { useMemo } from "react";

import { useRevenueReconciliation } from "@/api/doanh-thu/tanstack/use-revenue-reconciliation";
import { useCompanyStore } from "@/global-states/company-store";
import { useDoanhThuStore } from "@/global-states/doanh-thu-store";

const pad2 = (value: number) => String(value).padStart(2, "0");

/* Mốc khởi hành ISO → "dd/mm · HH:mm" theo giờ địa phương. */
function departureLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)} · ${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}`;
}

export type DoanhThuReconRow = {
  tripId: string;
  tripCode: string;
  routeName: string;
  departureLabel: string;
  bookedTickets: number;
  collectedTickets: number;
  expectedRevenue: number;
  collectedRevenue: number;
  driverWage: number | null;
  difference: number;
};

export type DoanhThuReconTotals = {
  bookedTickets: number;
  collectedTickets: number;
  collectedRevenue: number;
  driverWages: number | null;
};

/*
 * Nguồn dữ liệu khối "Đối soát theo chuyến": đọc bộ lọc kỳ từ store, gọi API
 * đối soát thực thu và map sang view-model hiển thị.
 */
export function useDoanhThuReconciliation() {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const from = useDoanhThuStore((s) => s.from);
  const to = useDoanhThuStore((s) => s.to);

  const query = useRevenueReconciliation(companyId, { from, to });

  const rows = useMemo<DoanhThuReconRow[]>(
    () =>
      (query.data?.trips ?? []).map((trip) => ({
        tripId: trip.tripId,
        tripCode: trip.tripCode,
        routeName: trip.routeName,
        departureLabel: departureLabel(trip.departureAt),
        bookedTickets: trip.bookedTickets,
        collectedTickets: trip.collectedTickets,
        expectedRevenue: trip.expectedRevenue,
        collectedRevenue: trip.collectedRevenue,
        driverWage: trip.driverWage,
        difference: trip.difference,
      })),
    [query.data]
  );

  const totals: DoanhThuReconTotals | null = query.data
    ? {
        bookedTickets: query.data.totals.bookedTickets,
        collectedTickets: query.data.totals.collectedTickets,
        collectedRevenue: query.data.totals.collectedRevenue,
        driverWages: query.data.totals.driverWages,
      }
    : null;

  const mismatchedTrips = query.data?.mismatchedTrips ?? 0;

  return {
    companyId,
    rows,
    totals,
    mismatchedTrips,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
