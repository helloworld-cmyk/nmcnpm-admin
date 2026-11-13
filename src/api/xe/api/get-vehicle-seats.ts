import { authApi } from "../../method";

import type { VehicleSeatLayoutResponse } from "./types";

/* Gọi API lấy sơ đồ ghế hiện tại của xe. */
export function getVehicleSeatsAPI(
  companyId: string,
  vehicleId: string
): Promise<VehicleSeatLayoutResponse> {
  return authApi.get<VehicleSeatLayoutResponse>(
    `/bus-companies/${companyId}/vehicles/${vehicleId}/seats`
  );
}
