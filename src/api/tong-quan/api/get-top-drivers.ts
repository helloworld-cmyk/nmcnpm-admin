import { authApi } from "../../method";

import type {
  DashboardDriverResponse,
  DashboardRangeQuery,
} from "./types";

/* Gọi API lấy top tài xế theo số chuyến được phân công. */
export function getTopDriversAPI(
  companyId: string,
  query?: DashboardRangeQuery
): Promise<DashboardDriverResponse[]> {
  return authApi.get<DashboardDriverResponse[]>(
    `/bus-companies/${companyId}/dashboard/top-drivers`,
    {
      params: {
        from: query?.from,
        to: query?.to,
      },
    }
  );
}
