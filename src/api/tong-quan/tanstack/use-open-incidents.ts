"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getOpenIncidentsAPI } from "../api/get-open-incidents";
import type {
  DashboardIncidentResponse,
  DashboardLimitQuery,
} from "../api/types";
import { ApiError } from "../../types";

type UseOpenIncidentsOptions = Omit<
  UseQueryOptions<DashboardIncidentResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query sự cố đang mở/đang xử lý của hãng; chỉ gọi khi có companyId. */
export function useOpenIncidents(
  companyId: string,
  query?: DashboardLimitQuery,
  options?: UseOpenIncidentsOptions
) {
  return useQuery<DashboardIncidentResponse[], ApiError>({
    queryKey: ["company-open-incidents", companyId, query?.limit],
    queryFn: () => getOpenIncidentsAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
