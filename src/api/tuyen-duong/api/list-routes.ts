import { authApi } from "../../method";

import type { RouteResponse } from "./types";

/* Gọi API lấy danh sách tuyến của hãng. */
export function listRoutesAPI(companyId: string): Promise<RouteResponse[]> {
  return authApi.get<RouteResponse[]>(`/bus-companies/${companyId}/routes`);
}