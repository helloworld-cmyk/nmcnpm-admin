"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { listBookingsAPI } from "../api/list-bookings";
import type {
  CompanyBookingSummaryResponse,
  ListBookingsQuery,
} from "../api/types";
import type { PageResponse } from "../../types";
import { ApiError } from "../../types";

type UseBookingsOptions = Omit<
  UseQueryOptions<PageResponse<CompanyBookingSummaryResponse>, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách đơn đặt vé toàn hãng theo bộ lọc; chỉ gọi khi có companyId. */
export function useBookings(
  companyId: string,
  query?: ListBookingsQuery,
  options?: UseBookingsOptions
) {
  return useQuery<PageResponse<CompanyBookingSummaryResponse>, ApiError>({
    queryKey: [
      "company-bookings",
      companyId,
      query?.q,
      query?.status,
      query?.viewStatus,
      query?.passengerTripStatus,
      query?.driverId,
      query?.tripId,
      query?.routeId,
      query?.customerId,
      query?.createdFrom,
      query?.createdTo,
      query?.departureFrom,
      query?.departureTo,
      query?.page,
      query?.size,
    ],
    queryFn: () => listBookingsAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
