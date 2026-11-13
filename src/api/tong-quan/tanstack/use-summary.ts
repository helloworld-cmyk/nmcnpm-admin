"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getDashboardSummaryAPI } from "../api/get-summary";
import type { DashboardRangeQuery, DashboardSummaryResponse } from "../api/types";
import { ApiError } from "../../types";

type UseSummaryOptions = Omit<
  UseQueryOptions<DashboardSummaryResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query KPI tổng quan của hãng; chỉ gọi khi có companyId. */
export function useSummary(
  companyId: string,
  query?: DashboardRangeQuery,
  options?: UseSummaryOptions
) {
  return useQuery<DashboardSummaryResponse, ApiError>({
    queryKey: ["company-summary", companyId, query?.from, query?.to],
    queryFn: () => getDashboardSummaryAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
