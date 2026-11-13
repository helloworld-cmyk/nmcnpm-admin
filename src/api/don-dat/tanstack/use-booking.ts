"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getBookingAPI } from "../api/get-booking";
import type { CompanyBookingResponse } from "../api/types";
import { ApiError } from "../../types";

type UseBookingOptions = Omit<
  UseQueryOptions<CompanyBookingResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query chi tiết đơn đặt vé; chỉ gọi khi có đủ companyId và bookingId. */
export function useBooking(
  companyId: string,
  bookingId: string,
  options?: UseBookingOptions
) {
  return useQuery<CompanyBookingResponse, ApiError>({
    queryKey: ["company-booking", companyId, bookingId],
    queryFn: () => getBookingAPI(companyId, bookingId),
    enabled: companyId.length > 0 && bookingId.length > 0,
    ...options,
  });
}
