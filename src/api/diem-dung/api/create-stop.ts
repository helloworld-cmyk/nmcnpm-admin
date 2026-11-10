import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { CreateStopPayload, StopResponse } from "./types";

/* Gọi API tạo điểm đón/trả mới cho hãng (trạng thái mới luôn ACTIVE). */
export function createStopAPI(
  companyId: string,
  payload: CreateStopPayload
): Promise<StopResponse> {
  return authApi.post<StopResponse>(
    `/bus-companies/${companyId}/stops`,
    wrapRequest(payload)
  );
}