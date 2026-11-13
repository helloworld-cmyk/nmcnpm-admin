import { authApi } from "../../method";

import type { CompanyBookingStatisticsResponse } from "./types";

/* Gọi API thống kê đơn đặt vé toàn hãng (không nhận bộ lọc). */
export function getBookingStatisticsAPI(
  companyId: string
): Promise<CompanyBookingStatisticsResponse> {
  return authApi.get<CompanyBookingStatisticsResponse>(
    `/bus-companies/${companyId}/bookings/summary`
  );
}
