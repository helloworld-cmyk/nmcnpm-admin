import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { CompanyDriverResponse, UpdateDriverStatusPayload } from "./types";

/* Gọi API khóa hoặc mở khóa tài xế tại hãng. */
export function updateDriverStatusAPI(
  companyId: string,
  driverId: string,
  payload: UpdateDriverStatusPayload
): Promise<CompanyDriverResponse> {
  return authApi.patch<CompanyDriverResponse>(
    `/bus-companies/${companyId}/drivers/${driverId}/status`,
    wrapRequest(payload)
  );
}
