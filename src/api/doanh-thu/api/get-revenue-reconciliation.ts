import { authApi } from "../../method";

import type {
  RevenueAnalyticsQuery,
  RevenueReconciliationResponse,
} from "./types";

/* Tham số đối soát thực thu; limit số chuyến từ 1 đến 100, mặc định 6. */
export type RevenueReconciliationQuery = RevenueAnalyticsQuery & {
  limit?: number;
};

/* Gọi API đối soát thực thu theo chuyến. */
export function getRevenueReconciliationAPI(
  companyId: string,
  query?: RevenueReconciliationQuery
): Promise<RevenueReconciliationResponse> {
  return authApi.get<RevenueReconciliationResponse>(
    `/bus-companies/${companyId}/reports/revenue/reconciliation`,
    {
      params: {
        from: query?.from,
        to: query?.to,
        route_id: query?.routeId,
        limit: query?.limit,
      },
    }
  );
}
