import { authApi } from "../../method";

import type { RouteResponse } from "./types";

/* Gọi API lấy chi tiết một tuyến thuộc hãng. */
export function getRouteAPI(
  companyId: string,
  routeId: string
): Promise<RouteResponse> {
  return authApi.get<RouteResponse>(
    `/bus-companies/${companyId}/routes/${routeId}`
  );
}