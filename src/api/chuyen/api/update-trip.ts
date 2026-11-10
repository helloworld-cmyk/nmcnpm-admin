import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { TripResponse, UpdateTripPayload } from "./types";

/* Gọi API cập nhật chuyến nháp (chỉ chuyến DRAFT được sửa). */
export function updateTripAPI(
  companyId: string,
  tripId: string,
  payload: UpdateTripPayload
): Promise<TripResponse> {
  return authApi.patch<TripResponse>(
    `/bus-companies/${companyId}/trips/${tripId}`,
    wrapRequest(payload)
  );
}