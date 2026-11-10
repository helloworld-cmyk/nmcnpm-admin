import { authApi } from "../../method";

import type { StopResponse } from "./types";

/* Gọi API lấy danh sách điểm đón/trả của hãng. */
export function listStopsAPI(companyId: string): Promise<StopResponse[]> {
  return authApi.get<StopResponse[]>(`/bus-companies/${companyId}/stops`);
}