"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getBookingStatusCountsAPI } from "../api/get-booking-status-counts";
import type {
  CompanyBookingStatusCountsResponse,
  ListBookingsQuery,
} from "../api/types";
import { ApiError } from "../../types";

type UseBookingStatusCountsOptions = Omit<
  UseQueryOptions<CompanyBookingStatusCountsResponse, ApiError>,
  "queryKey" | "queryFn"
>;

/* Query số đơn theo từng tab trạng thái; chỉ gọi khi có companyId. */
export function useBookingStatusCounts(
  companyId: string,
  query?: ListBookingsQuery,
  options?: UseBookingStatusCountsOptions
) {
  return useQuery<CompanyBookingStatusCountsResponse, ApiError>({
    queryKey: [
      "company-booking-status-counts",
      companyId,
      query?.q,
      query?.status,
      query?.passengerTripStatus,
      query?.driverId,
      query?.tripId,
      query?.routeId,
      query?.customerId,
      query?.createdFrom,
      query?.createdTo,
      query?.departureFrom,
      query?.departureTo,
    ],
    queryFn: () => getBookingStatusCountsAPI(companyId, query),
    enabled: companyId.length > 0,
    ...options,
  });
}
