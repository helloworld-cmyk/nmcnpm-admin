"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { getTripBookingsAPI } from "../api/get-trip-bookings";
import type { TripPassengerBookingResponse } from "../api/types";
import { ApiError } from "../../types";

type UseTripBookingsOptions = Omit<
  UseQueryOptions<TripPassengerBookingResponse[], ApiError>,
  "queryKey" | "queryFn"
>;

/* Query danh sách đặt vé và hành khách của chuyến; chỉ gọi khi có đủ id. */
export function useTripBookings(
  companyId: string,
  tripId: string,
  options?: UseTripBookingsOptions
) {
  return useQuery<TripPassengerBookingResponse[], ApiError>({
    queryKey: ["company-trip-bookings", companyId, tripId],
    queryFn: () => getTripBookingsAPI(companyId, tripId),
    enabled: companyId.length > 0 && tripId.length > 0,
    ...options,
  });
}
