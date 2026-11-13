"use client";

import { useMemo } from "react";

import { useRevenueByRoute } from "@/api/doanh-thu/tanstack/use-revenue-by-route";
import { useCompanyStore } from "@/global-states/company-store";
import { useDoanhThuStore } from "@/global-states/doanh-thu-store";

export type DoanhThuRouteRow = {
  routeId: string;
  routeName: string;
  collectedRevenue: number;
  /* Tỷ lệ đóng góp trên tổng thực thu trong kỳ (0..1). */
  share: number;
};

/*
 * Nguồn dữ liệu khối "Doanh thu theo tuyến": đọc bộ lọc kỳ từ store, gọi API
 * thực thu theo tuyến và sắp xếp giảm dần theo thực thu.
 */
export function useDoanhThuByRoute() {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const from = useDoanhThuStore((s) => s.from);
  const to = useDoanhThuStore((s) => s.to);

  const query = useRevenueByRoute(companyId, { from, to });

  const rows = useMemo<DoanhThuRouteRow[]>(() => {
    const data = query.data ?? [];
    const total = data.reduce((sum, route) => sum + route.collectedRevenue, 0);
    return [...data]
      .sort((a, b) => b.collectedRevenue - a.collectedRevenue)
      .map((route) => ({
        routeId: route.routeId,
        routeName: route.routeName,
        collectedRevenue: route.collectedRevenue,
        share: total > 0 ? route.collectedRevenue / total : 0,
      }));
  }, [query.data]);

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + row.collectedRevenue, 0),
    [rows]
  );

  return {
    companyId,
    rows,
    total,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
