import { authApi } from "../../method";

import type {
  DashboardLimitQuery,
  DashboardTodayTripResponse,
} from "./types";

/* Gọi API lấy danh sách chuyến hôm nay của hãng (bỏ chuyến nháp). */
export function getTodayTripsAPI(
  companyId: string,
  query?: DashboardLimitQuery
): Promise<DashboardTodayTripResponse[]> {
  return authApi.get<DashboardTodayTripResponse[]>(
    `/bus-companies/${companyId}/dashboard/today-trips`,
    {
      params: {
        limit: query?.limit,
      },
    }
  );
}
