import { authApi } from "../../method";

import type { CompanyBookingResponse } from "./types";

/* Gọi API lấy chi tiết một đơn đặt vé thuộc hãng. */
export function getBookingAPI(
  companyId: string,
  bookingId: string
): Promise<CompanyBookingResponse> {
  return authApi.get<CompanyBookingResponse>(
    `/bus-companies/${companyId}/bookings/${bookingId}`
  );
}
