import { authApi } from "../../method";

import type { DashboardRouteResponse, TopRoutesQuery } from "./types";

/* Gọi API lấy top tuyến theo giá trị vé CONFIRMED trong kỳ. */
export function getTopRoutesAPI(
  companyId: string,
  query?: TopRoutesQuery
): Promise<DashboardRouteResponse[]> {
  return authApi.get<DashboardRouteResponse[]>(
    `/bus-companies/${companyId}/dashboard/top-routes`,
    {
      params: {
        from: query?.from,
        to: query?.to,
        limit: query?.limit,
      },
    }
  );
}
