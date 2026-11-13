"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getTopDriversAPI } from "../api/get-top-drivers";
import type {
  DashboardDriverResponse,
  DashboardRangeQuery,
} from "../api/types";
import { ApiError } from "../../types";

type UseTopDriversOptions = Omit<
  UseQueryOptions<DashboardDriverResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query top tài xế theo số chuyến được phân công; chỉ gọi khi có companyId. */
export function useTopDrivers(
  companyId: string,
  query?: DashboardRangeQuery,
  options?: UseTopDriversOptions
) {
  return useQuery<DashboardDriverResponse[], ApiError>({
    queryKey: ["company-top-drivers", companyId, query?.from, query?.to],
    queryFn: () => getTopDriversAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
