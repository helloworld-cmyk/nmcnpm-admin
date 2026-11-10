import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { CreateRoutePayload, RouteResponse } from "./types";

/* Gọi API tạo tuyến mới cho hãng (trạng thái mới mặc định ACTIVE). */
export function createRouteAPI(
  companyId: string,
  payload: CreateRoutePayload
): Promise<RouteResponse> {
  return authApi.post<RouteResponse>(
    `/bus-companies/${companyId}/routes`,
    wrapRequest(payload)
  );
}