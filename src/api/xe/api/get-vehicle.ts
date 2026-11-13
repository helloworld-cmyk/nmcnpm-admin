import { authApi } from "../../method";

import type { VehicleResponse } from "./types";

/* Gọi API lấy chi tiết một xe thuộc hãng. */
export function getVehicleAPI(
  companyId: string,
  vehicleId: string
): Promise<VehicleResponse> {
  return authApi.get<VehicleResponse>(
    `/bus-companies/${companyId}/vehicles/${vehicleId}`
  );
}
