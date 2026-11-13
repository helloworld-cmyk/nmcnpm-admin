import { authApi } from "../../method";

import type {
  CompanyBookingStatusCountsResponse,
  ListBookingsQuery,
} from "./types";

/* Gọi API đếm số đơn theo từng tab trạng thái (áp dụng bộ lọc, bỏ viewStatus và phân trang). */
export function getBookingStatusCountsAPI(
  companyId: string,
  query?: ListBookingsQuery
): Promise<CompanyBookingStatusCountsResponse> {
  return authApi.get<CompanyBookingStatusCountsResponse>(
    `/bus-companies/${companyId}/bookings/status-counts`,
    {
      params: {
        q: query?.q,
        status: query?.status,
        passengerTripStatus: query?.passengerTripStatus,
        driverId: query?.driverId,
        tripId: query?.tripId,
        routeId: query?.routeId,
        customerId: query?.customerId,
        createdFrom: query?.createdFrom,
        createdTo: query?.createdTo,
        departureFrom: query?.departureFrom,
        departureTo: query?.departureTo,
      },
    }
  );
}
