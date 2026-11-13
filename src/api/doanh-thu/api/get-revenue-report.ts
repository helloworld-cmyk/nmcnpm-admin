import { authApi } from "../../method";

import type { RevenueReportQuery, RevenueReportResponse } from "./types";

/* Gọi API lấy báo cáo giá trị vé theo kỳ (mặc định lọc vé CONFIRMED). */
export function getRevenueReportAPI(
  companyId: string,
  query?: RevenueReportQuery
): Promise<RevenueReportResponse> {
  return authApi.get<RevenueReportResponse>(
    `/bus-companies/${companyId}/reports/revenue`,
    {
      params: {
        from: query?.from,
        to: query?.to,
        status: query?.status,
      },
    }
  );
}
