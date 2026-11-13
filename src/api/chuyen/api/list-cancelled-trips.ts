import { authApi } from "../../method";

import type { TripResponse } from "./types";

/* Gọi API lấy toàn bộ chuyến CANCELLED hoặc TERMINATED của hãng (không phân trang). */
export function listCancelledTripsAPI(
  companyId: string
): Promise<TripResponse[]> {
  return authApi.get<TripResponse[]>(
    `/bus-companies/${companyId}/trips/cancelled`
  );
}
