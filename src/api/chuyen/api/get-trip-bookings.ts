import { authApi } from "../../method";

import type { TripPassengerBookingResponse } from "./types";

/* Gọi API lấy danh sách đặt vé và hành khách của chuyến. */
export function getTripBookingsAPI(
  companyId: string,
  tripId: string
): Promise<TripPassengerBookingResponse[]> {
  return authApi.get<TripPassengerBookingResponse[]>(
    `/bus-companies/${companyId}/trips/${tripId}/bookings`
  );
}
