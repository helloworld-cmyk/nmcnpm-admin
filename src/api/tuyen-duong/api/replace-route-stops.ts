import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { ReplaceRouteStopsPayload, RouteResponse } from "./types";

/* Gọi API thay thế toàn bộ danh sách điểm dừng mẫu của tuyến. */
export function replaceRouteStopsAPI(
  companyId: string,
  routeId: string,
  payload: ReplaceRouteStopsPayload
): Promise<RouteResponse> {
  return authApi.put<RouteResponse>(
    `/bus-companies/${companyId}/routes/${routeId}/stops`,
    wrapRequest(payload)
  );
}