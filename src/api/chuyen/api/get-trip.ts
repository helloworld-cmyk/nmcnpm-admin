import { authApi } from "../../method";

import type { TripResponse } from "./types";

/* Gọi API lấy chi tiết một chuyến thuộc hãng kèm điểm dừng đã chụp. */
export function getTripAPI(
  companyId: string,
  tripId: string
): Promise<TripResponse> {
  return authApi.get<TripResponse>(
    `/bus-companies/${companyId}/trips/${tripId}`
  );
}