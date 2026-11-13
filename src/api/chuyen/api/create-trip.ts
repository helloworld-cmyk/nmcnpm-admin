import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { CreateTripPayload, CreateTripResponse } from "./types";

/* Gọi API tạo chuyến nháp từ tuyến đang hoạt động của hãng. */
export function createTripAPI(
  companyId: string,
  payload: CreateTripPayload
): Promise<CreateTripResponse> {
  return authApi.post<CreateTripResponse>(
    `/bus-companies/${companyId}/trips`,
    wrapRequest(payload)
  );
}