import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { RouteResponse, UpdateRoutePayload } from "./types";

/* Gọi API cập nhật một phần thông tin tuyến. */
export function updateRouteAPI(
  companyId: string,
  routeId: string,
  payload: UpdateRoutePayload
): Promise<RouteResponse> {
  return authApi.patch<RouteResponse>(
    `/bus-companies/${companyId}/routes/${routeId}`,
    wrapRequest(payload)
  );
}