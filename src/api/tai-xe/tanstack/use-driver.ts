"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getDriverAPI } from "../api/get-driver";
import type { CompanyDriverResponse } from "../api/types";
import { ApiError } from "../../types";

type UseDriverOptions = Omit<
  UseQueryOptions<CompanyDriverResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query chi tiết tài xế theo id; chỉ gọi khi có đủ companyId và driverId. */
export function useDriver(
  companyId: string,
  driverId: string,
  options?: UseDriverOptions
) {
  return useQuery<CompanyDriverResponse, ApiError>({
    queryKey: ["company-driver", companyId, driverId],
    queryFn: () => getDriverAPI(companyId, driverId),
    enabled: companyId.length > 0 && driverId.length > 0,
    ...options,
  });
}
