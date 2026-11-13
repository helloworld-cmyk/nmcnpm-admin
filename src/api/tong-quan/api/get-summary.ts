import { authApi } from "../../method";

import type { DashboardRangeQuery, DashboardSummaryResponse } from "./types";

/* Gọi API lấy KPI tổng quan của hãng trong kỳ. */
export function getDashboardSummaryAPI(
  companyId: string,
  query?: DashboardRangeQuery
): Promise<DashboardSummaryResponse> {
  return authApi.get<DashboardSummaryResponse>(
    `/bus-companies/${companyId}/dashboard/summary`,
    {
      params: {
        from: query?.from,
        to: query?.to,
      },
    }
  );
}
