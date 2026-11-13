import { authApi } from "../../method";

import type { TripDetailResponse } from "./types";

/* Gọi API lấy chi tiết một chuyến thuộc hãng. */
export function getTripAPI(
  companyId: string,
  tripId: string
): Promise<TripDetailResponse> {
  return authApi.get<TripDetailResponse>(
    `/bus-companies/${companyId}/trips/${tripId}`
  );
}