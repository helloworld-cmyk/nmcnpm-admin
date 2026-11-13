"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getRevenueReportAPI } from "../api/get-revenue-report";
import type { RevenueReportQuery, RevenueReportResponse } from "../api/types";
import { ApiError } from "../../types";

type UseRevenueReportOptions = Omit<
  UseQueryOptions<RevenueReportResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query báo cáo doanh thu của hãng; chỉ gọi khi có companyId. */
export function useRevenueReport(
  companyId: string,
  query?: RevenueReportQuery,
  options?: UseRevenueReportOptions
) {
  return useQuery<RevenueReportResponse, ApiError>({
    queryKey: [
      "company-revenue-report",
      companyId,
      query?.from,
      query?.to,
      query?.status,
      query?.routeId,
    ],
    queryFn: () => getRevenueReportAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
