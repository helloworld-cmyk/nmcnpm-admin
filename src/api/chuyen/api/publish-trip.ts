import { authApi } from "../../method";

import type { TripResponse } from "./types";

/* Gọi API công bố và mở bán chuyến nháp. */
export function publishTripAPI(
  companyId: string,
  tripId: string
): Promise<TripResponse> {
  return authApi.post<TripResponse>(
    `/bus-companies/${companyId}/trips/${tripId}/publish`
  );
}