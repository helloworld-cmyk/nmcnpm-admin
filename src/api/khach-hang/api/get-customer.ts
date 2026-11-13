import { authApi } from "../../method";

import type { CompanyCustomerDetailResponse } from "./types";

/* Gọi API lấy chi tiết khách hàng và lịch sử booking tại hãng. */
export function getCustomerAPI(
  companyId: string,
  customerId: string
): Promise<CompanyCustomerDetailResponse> {
  return authApi.get<CompanyCustomerDetailResponse>(
    `/bus-companies/${companyId}/customers/${customerId}`
  );
}
