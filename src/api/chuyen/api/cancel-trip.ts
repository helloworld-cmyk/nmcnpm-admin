import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { CancelTripPayload, TripResponse } from "./types";

/* Gọi API hủy chuyến chưa bắt đầu (đóng bán vé, hủy đặt chỗ/vé còn hiệu lực). */
export function cancelTripAPI(
  companyId: string,
  tripId: string,
  payload: CancelTripPayload
): Promise<TripResponse> {
  return authApi.post<TripResponse>(
    `/bus-companies/${companyId}/trips/${tripId}/cancel`,
    wrapRequest(payload)
  );
}
