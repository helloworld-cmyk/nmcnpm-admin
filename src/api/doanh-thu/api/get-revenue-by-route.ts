import { authApi } from "../../method";

import type { RevenueAnalyticsQuery, RevenueRouteResponse } from "./types";

/* Gọi API lấy thực thu theo tuyến và ngày khởi hành. */
export function getRevenueByRouteAPI(
  companyId: string,
  query?: RevenueAnalyticsQuery
): Promise<RevenueRouteResponse[]> {
  return authApi.get<RevenueRouteResponse[]>(
    `/bus-companies/${companyId}/reports/revenue/by-route`,
    {
      params: {
        from: query?.from,
        to: query?.to,
        route_id: query?.routeId,
      },
    }
  );
}
