import { authApi } from "../../method";

import type { TripResponse } from "./types";

/* Gọi API lấy toàn bộ chuyến IN_PROGRESS của hãng (không phân trang, giờ khởi hành giảm dần). */
export function listInProgressTripsAPI(
  companyId: string
): Promise<TripResponse[]> {
  return authApi.get<TripResponse[]>(
    `/bus-companies/${companyId}/trips/in-progress`
  );
}
