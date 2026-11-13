import { authApi } from "../../method";

import type { CompanyDriverResponse } from "./types";

/* Gọi API lấy chi tiết một tài xế thuộc hãng. */
export function getDriverAPI(
  companyId: string,
  driverId: string
): Promise<CompanyDriverResponse> {
  return authApi.get<CompanyDriverResponse>(
    `/bus-companies/${companyId}/drivers/${driverId}`
  );
}
