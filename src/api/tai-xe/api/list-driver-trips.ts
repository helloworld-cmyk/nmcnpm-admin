import { authApi } from "../../method";
import type { PageResponse } from "../../types";

import type { CompanyDriverTripResponse } from "./types";

/* Gọi API lấy các chuyến được phân công gần đây của tài xế (phân trang). */
export function listDriverTripsAPI(
  companyId: string,
  driverId: string,
  page = 0,
  size = 5
): Promise<PageResponse<CompanyDriverTripResponse>> {
  return authApi.get<PageResponse<CompanyDriverTripResponse>>(
    `/bus-companies/${companyId}/drivers/${driverId}/trips`,
    { params: { page, size } }
  );
}
