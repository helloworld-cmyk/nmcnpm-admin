import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { CancelBookingPayload, CompanyBookingResponse } from "./types";

/* Gọi API admin hãng hủy đơn đặt vé (giải phóng ghế, lưu lý do và người hủy). */
export function cancelBookingAPI(
  companyId: string,
  bookingId: string,
  payload: CancelBookingPayload
): Promise<CompanyBookingResponse> {
  return authApi.post<CompanyBookingResponse>(
    `/bus-companies/${companyId}/bookings/${bookingId}/cancel`,
    wrapRequest(payload)
  );
}
