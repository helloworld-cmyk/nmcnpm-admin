import { authApi } from "../../method";

import type { CompanyCustomerResponse, ListCustomersQuery } from "./types";

/* Gọi API lấy danh sách khách đã đặt vé tại hãng (lọc theo từ khóa, trạng thái). */
export function listCustomersAPI(
  companyId: string,
  query?: ListCustomersQuery
): Promise<CompanyCustomerResponse[]> {
  return authApi.get<CompanyCustomerResponse[]>(
    `/bus-companies/${companyId}/customers`,
    {
      params: {
        q: query?.q,
        accountStatus: query?.accountStatus,
        bookingStatus: query?.bookingStatus,
      },
    }
  );
}
