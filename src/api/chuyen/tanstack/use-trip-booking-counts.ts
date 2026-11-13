"use client";

import { useQueries } from "@tanstack/react-query";

import { getTripBookingsAPI } from "../api/get-trip-bookings";
import type { TripPassengerBookingResponse } from "../api/types";

/* Vé đã hủy/hết hạn không còn chiếm ghế nên không tính vào số ghế đã đặt. */
const soVeConHieuLuc = (booking: TripPassengerBookingResponse) =>
  booking.passengers.filter(
    (ticket) => ticket.status !== "CANCELLED" && ticket.status !== "EXPIRED"
  ).length;

/* Số ghế đã đặt của chuyến = tổng vé còn hiệu lực trên mọi đặt vé. */
export function countBookedSeats(
  bookings: TripPassengerBookingResponse[]
): number {
  return bookings.reduce(
    (total, booking) => total + soVeConHieuLuc(booking),
    0
  );
}

/*
 * Query danh sách đặt vé của nhiều chuyến song song (dùng chung queryKey với
 * useTripBookings để tái sử dụng cache), trả map tripId → số ghế đã đặt.
 */
export function useTripBookingCounts(companyId: string, tripIds: string[]) {
  return useQueries({
    queries: tripIds.map((tripId) => ({
      queryKey: ["company-trip-bookings", companyId, tripId],
      queryFn: () => getTripBookingsAPI(companyId, tripId),
      enabled: companyId.length > 0 && tripId.length > 0,
    })),
    combine: (results) => {
      const byTripId: Record<string, number> = {};
      results.forEach((result, index) => {
        if (result.data) {
          byTripId[tripIds[index]] = countBookedSeats(result.data);
        }
      });
      return byTripId;
    },
  });
}