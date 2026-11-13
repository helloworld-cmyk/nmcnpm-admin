import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type { UpdateVehiclePayload, VehicleResponse } from "./types";

/* Gọi API cập nhật thông tin hoặc trạng thái xe. */
export function updateVehicleAPI(
  companyId: string,
  vehicleId: string,
  payload: UpdateVehiclePayload
): Promise<VehicleResponse> {
  return authApi.patch<VehicleResponse>(
    `/bus-companies/${companyId}/vehicles/${vehicleId}`,
    wrapRequest(payload)
  );
}
