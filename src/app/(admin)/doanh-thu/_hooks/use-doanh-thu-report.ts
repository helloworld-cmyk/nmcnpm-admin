"use client";

import { useMemo } from "react";

import { useRevenueReport } from "@/api/doanh-thu/tanstack/use-revenue-report";
import { useCompanyStore } from "@/global-states/company-store";
import { useDoanhThuStore } from "@/global-states/doanh-thu-store";
import { mapRevenueReport } from "../_utils/map-report";

/*
 * Nguồn dữ liệu chung cho màn Doanh thu: đọc bộ lọc kỳ từ store, gọi API báo cáo
 * theo companyId đang chọn và map sang view-model.
 */
export function useDoanhThuReport() {
  const companyId = useCompanyStore((s) => s.companyId) ?? "";
  const from = useDoanhThuStore((s) => s.from);
  const to = useDoanhThuStore((s) => s.to);

  const query = useRevenueReport(companyId, { from, to });

  const report = useMemo(
    () => (query.data ? mapRevenueReport(query.data) : null),
    [query.data]
  );

  return {
    companyId,
    report,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
