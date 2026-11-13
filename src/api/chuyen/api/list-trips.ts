import { authApi } from "../../method";

import type { ListTripsQuery, TripResponse } from "./types";

/* Gọi API lấy chuyến của hãng theo bộ lọc (gồm cả chuyến nháp và đã mở bán). */
export function listTripsAPI(
  companyId: string,
  query?: ListTripsQuery
): Promise<TripResponse[]> {
  return authApi.get<TripResponse[]>(`/bus-companies/${companyId}/trips`, {
    params: {
      date: query?.date,
      status: query?.status,
      routeId: query?.routeId,
      assignmentStatus: query?.assignmentStatus,
    },
  });
}
