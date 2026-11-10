import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { CreateTripPayload, TripResponse } from "./types";

/* Gọi API tạo chuyến nháp từ tuyến đang hoạt động của hãng. */
export function createTripAPI(
  companyId: string,
  payload: CreateTripPayload
): Promise<TripResponse> {
  return authApi.post<TripResponse>(
    `/bus-companies/${companyId}/trips`,
    wrapRequest(payload)
  );
}