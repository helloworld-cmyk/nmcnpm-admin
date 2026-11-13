import { authApi } from "../../method";
import type { PageResponse } from "../../types";

import type {
  CompanyBookingSummaryResponse,
  ListBookingsQuery,
} from "./types";

/* Gọi API danh sách đơn đặt vé toàn hãng (tìm kiếm, lọc, phân trang). */
export function listBookingsAPI(
  companyId: string,
  query?: ListBookingsQuery
): Promise<PageResponse<CompanyBookingSummaryResponse>> {
  return authApi.get<PageResponse<CompanyBookingSummaryResponse>>(
    `/bus-companies/${companyId}/bookings`,
    {
      params: {
        q: query?.q,
        status: query?.status,
        viewStatus: query?.viewStatus,
        passengerTripStatus: query?.passengerTripStatus,
        driverId: query?.driverId,
        tripId: query?.tripId,
        routeId: query?.routeId,
        customerId: query?.customerId,
        createdFrom: query?.createdFrom,
        createdTo: query?.createdTo,
        departureFrom: query?.departureFrom,
        departureTo: query?.departureTo,
        page: query?.page,
        size: query?.size,
      },
    }
  );
}
