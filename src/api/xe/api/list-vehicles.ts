import { authApi } from "../../method";

import type { ListVehiclesQuery, VehicleResponse } from "./types";

/* Gọi API lấy danh sách xe của hãng (tìm theo biển số/mẫu xe, lọc trạng thái). */
export function listVehiclesAPI(
  companyId: string,
  query?: ListVehiclesQuery
): Promise<VehicleResponse[]> {
  return authApi.get<VehicleResponse[]>(
    `/bus-companies/${companyId}/vehicles`,
    {
      params: {
        q: query?.q,
        status: query?.status,
      },
    }
  );
}
