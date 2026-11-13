"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listDriverTripsAPI } from "../api/list-driver-trips";
import type { CompanyDriverTripResponse } from "../api/types";
import { ApiError, type PageResponse } from "../../types";

type UseDriverTripsOptions = Omit<
  UseQueryOptions<PageResponse<CompanyDriverTripResponse>, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query các chuyến được phân công gần đây của tài xế; chỉ gọi khi có đủ companyId và driverId. */
export function useDriverTrips(
  companyId: string,
  driverId: string,
  page = 0,
  size = 5,
  options?: UseDriverTripsOptions
) {
  return useQuery<PageResponse<CompanyDriverTripResponse>, ApiError>({
    queryKey: ["company-driver-trips", companyId, driverId, page, size],
    queryFn: () => listDriverTripsAPI(companyId, driverId, page, size),
    enabled: companyId.length > 0 && driverId.length > 0,
    ...options,
  });
}
