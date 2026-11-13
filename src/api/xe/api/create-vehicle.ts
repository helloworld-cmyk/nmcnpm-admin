import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { CreateVehiclePayload, VehicleResponse } from "./types";

/* Gọi API thêm xe cho hãng. */
export function createVehicleAPI(
  companyId: string,
  payload: CreateVehiclePayload
): Promise<VehicleResponse> {
  return authApi.post<VehicleResponse>(
    `/bus-companies/${companyId}/vehicles`,
    wrapRequest(payload)
  );
}
