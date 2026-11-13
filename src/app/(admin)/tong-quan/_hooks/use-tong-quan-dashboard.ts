"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useSummary } from "@/api/tong-quan/tanstack/use-summary";
import { useTopDrivers } from "@/api/tong-quan/tanstack/use-top-drivers";
import { useTripPoints } from "@/api/tong-quan/tanstack/use-trip-points";
import { useTodayTrips } from "@/api/tong-quan/tanstack/use-today-trips";
import { useTopRoutes } from "@/api/tong-quan/tanstack/use-top-routes";
import { useOpenIncidents } from "@/api/tong-quan/tanstack/use-open-incidents";
import { useRevenueReport } from "@/api/doanh-thu/tanstack/use-revenue-report";
import { useCompanyStore } from "@/global-states/company-store";
import {
  mapOpenIncidents,
  mapSummaryToKpis,
  mapTodayTrips,
  mapTopDrivers,
  mapTopRoutes,
  mapTripPointsToChart,
} from "../_utils/map-dashboard";

/*
 * State + nghiệp vụ của màn Tổng quan (truy vấn KPI, biểu đồ doanh thu, top tài
 * xế, chuyến hôm nay, top tuyến, sự cố đang mở). Component
 * `TongQuanDashboard` chỉ còn render UI.
 */
export function useTongQuanDashboard() {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const companyHydrated = useCompanyStore((s) => s.hydrated);
  const queryClient = useQueryClient();

  const summaryQuery = useSummary(companyId);
  const pointsQuery = useTripPoints(companyId);
  const revenueQuery = useRevenueReport(companyId);
  const driversQuery = useTopDrivers(companyId);
  const todayTripsQuery = useTodayTrips(companyId);
  const topRoutesQuery = useTopRoutes(companyId);
  const incidentsQuery = useOpenIncidents(companyId);

  const kpis = useMemo(
    () => (summaryQuery.data ? mapSummaryToKpis(summaryQuery.data) : []),
    [summaryQuery.data]
  );
  const revenueByDate = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const period of revenueQuery.data?.periods ?? []) {
      byDate.set(period.date, period.ticketValue);
    }
    return byDate;
  }, [revenueQuery.data]);
  const points = useMemo(
    () => mapTripPointsToChart(pointsQuery.data ?? [], revenueByDate),
    [pointsQuery.data, revenueByDate]
  );
  const drivers = useMemo(
    () => mapTopDrivers(driversQuery.data ?? []),
    [driversQuery.data]
  );
  const todayTrips = useMemo(
    () => mapTodayTrips(todayTripsQuery.data ?? []),
    [todayTripsQuery.data]
  );
  const topRoutes = useMemo(
    () => mapTopRoutes(topRoutesQuery.data ?? []),
    [topRoutesQuery.data]
  );
  const incidents = useMemo(
    () => mapOpenIncidents(incidentsQuery.data ?? []),
    [incidentsQuery.data]
  );

  const reload = () => {
    void queryClient.invalidateQueries({
      queryKey: ["company-summary", companyId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["company-trip-points", companyId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["company-revenue-report", companyId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["company-top-drivers", companyId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["company-today-trips", companyId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["company-top-routes", companyId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["company-open-incidents", companyId],
    });
  };

  return {
    companyId,
    companyHydrated,
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError || !summaryQuery.data,
    error: summaryQuery.error ?? null,
    kpis,
    points,
    drivers,
    todayTrips,
    topRoutes,
    incidents,
    reload,
  };
}
