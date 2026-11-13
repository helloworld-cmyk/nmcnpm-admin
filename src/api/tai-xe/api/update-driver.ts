import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { CompanyDriverResponse, UpdateDriverPayload } from "./types";

/* Gọi API cập nhật thông tin cá nhân và giấy phép lái xe của tài xế. */
export function updateDriverAPI(
  companyId: string,
  driverId: string,
  payload: UpdateDriverPayload
): Promise<CompanyDriverResponse> {
  return authApi.patch<CompanyDriverResponse>(
    `/bus-companies/${companyId}/drivers/${driverId}`,
    wrapRequest(payload)
  );
}
