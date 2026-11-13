"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getBookingStatisticsAPI } from "../api/get-booking-statistics";
import type { CompanyBookingStatisticsResponse } from "../api/types";
import { ApiError } from "../../types";

type UseBookingStatisticsOptions = Omit<
  UseQueryOptions<CompanyBookingStatisticsResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query thống kê đơn đặt vé toàn hãng; chỉ gọi khi có companyId. */
export function useBookingStatistics(
  companyId: string,
  options?: UseBookingStatisticsOptions
) {
  return useQuery<CompanyBookingStatisticsResponse, ApiError>({
    queryKey: ["company-booking-statistics", companyId],
    queryFn: () => getBookingStatisticsAPI(companyId),
    enabled: companyId.length > 0,
    ...options,
  });
}
