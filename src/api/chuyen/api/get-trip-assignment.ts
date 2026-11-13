import { authApi } from "../../method";

import type { TripAssignmentResponse } from "./types";

/* Gọi API xem phân công xe và tài xế hiện tại của chuyến. */
export function getTripAssignmentAPI(
  companyId: string,
  tripId: string
): Promise<TripAssignmentResponse> {
  return authApi.get<TripAssignmentResponse>(
    `/bus-companies/${companyId}/trips/${tripId}/assignments`
  );
}
