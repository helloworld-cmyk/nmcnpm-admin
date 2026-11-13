import { authApi } from "../../method";

import type {
  DashboardRangeQuery,
  DashboardTripPointResponse,
} from "./types";

/* Gọi API lấy tổng hợp chuyến theo ngày khởi hành và trạng thái. */
export function getTripPointsAPI(
  companyId: string,
  query?: DashboardRangeQuery
): Promise<DashboardTripPointResponse[]> {
  return authApi.get<DashboardTripPointResponse[]>(
    `/bus-companies/${companyId}/dashboard/trips`,
    {
      params: {
        from: query?.from,
        to: query?.to,
      },
    }
  );
}
