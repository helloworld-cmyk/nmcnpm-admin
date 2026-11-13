"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import {
  getRevenueReconciliationAPI,
  type RevenueReconciliationQuery,
} from "../api/get-revenue-reconciliation";
import type { RevenueReconciliationResponse } from "../api/types";
import { ApiError } from "../../types";

type UseRevenueReconciliationOptions = Omit<
  UseQueryOptions<RevenueReconciliationResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query đối soát thực thu theo chuyến; chỉ gọi khi có companyId. */
export function useRevenueReconciliation(
  companyId: string,
  query?: RevenueReconciliationQuery,
  options?: UseRevenueReconciliationOptions
) {
  return useQuery<RevenueReconciliationResponse, ApiError>({
    queryKey: [
      "company-revenue-reconciliation",
      companyId,
      query?.from,
      query?.to,
      query?.routeId,
      query?.limit,
    ],
    queryFn: () => getRevenueReconciliationAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
