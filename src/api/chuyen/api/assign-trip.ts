import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { AssignTripPayload, TripAssignmentResponse } from "./types";

/* Gọi API gán hoặc thay xe và tài xế cho chuyến. */
export function assignTripAPI(
  companyId: string,
  tripId: string,
  payload: AssignTripPayload
): Promise<TripAssignmentResponse> {
  return authApi.put<TripAssignmentResponse>(
    `/bus-companies/${companyId}/trips/${tripId}/assignments`,
    wrapRequest(payload)
  );
}
