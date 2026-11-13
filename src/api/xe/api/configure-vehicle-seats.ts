import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type {
  ConfigureVehicleSeatsPayload,
  VehicleSeatLayoutResponse,
} from "./types";

/* Gọi API cấu hình sơ đồ ghế của xe (tạo bản sửa đồ ghế mới, bất biến). */
export function configureVehicleSeatsAPI(
  companyId: string,
  vehicleId: string,
  payload: ConfigureVehicleSeatsPayload
): Promise<VehicleSeatLayoutResponse> {
  return authApi.put<VehicleSeatLayoutResponse>(
    `/bus-companies/${companyId}/vehicles/${vehicleId}/seats`,
    wrapRequest(payload)
  );
}
