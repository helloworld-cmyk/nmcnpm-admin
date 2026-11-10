import { authApi } from "../../method";

import type { TripResponse } from "./types";

/* Gọi API lấy toàn bộ chuyến của hãng (gồm cả chuyến nháp và đã mở bán). */
export function listTripsAPI(companyId: string): Promise<TripResponse[]> {
  return authApi.get<TripResponse[]>(`/bus-companies/${companyId}/trips`);
}