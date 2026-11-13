import { authApi } from "../../method";
import type { PageResponse } from "../../types";

import type { CompanyDriverResponse, ListDriversQuery } from "./types";

/* Gọi API lấy danh sách tài xế của hãng (tìm theo tên/SĐT/email, lọc trạng thái, phân trang). */
export function listDriversAPI(
  companyId: string,
  query?: ListDriversQuery
): Promise<PageResponse<CompanyDriverResponse>> {
  return authApi.get<PageResponse<CompanyDriverResponse>>(
    `/bus-companies/${companyId}/drivers`,
    {
      params: {
        search: query?.search,
        status: query?.status,
        page: query?.page,
        size: query?.size,
      },
    }
  );
}
