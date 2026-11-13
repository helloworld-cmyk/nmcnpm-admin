import { authApi } from "../../method";

import type {
  DashboardIncidentResponse,
  DashboardLimitQuery,
} from "./types";

/* Gọi API lấy danh sách sự cố đang mở/đang xử lý của hãng. */
export function getOpenIncidentsAPI(
  companyId: string,
  query?: DashboardLimitQuery
): Promise<DashboardIncidentResponse[]> {
  return authApi.get<DashboardIncidentResponse[]>(
    `/bus-companies/${companyId}/dashboard/open-incidents`,
    {
      params: {
        limit: query?.limit,
      },
    }
  );
}
