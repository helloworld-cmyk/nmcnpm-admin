import { authApi } from "../../method";

import type { VehicleDocumentResponse } from "./types";

/* Gọi API lấy danh sách giấy tờ hiện có của xe. */
export function listVehicleDocumentsAPI(
  companyId: string,
  vehicleId: string
): Promise<VehicleDocumentResponse[]> {
  return authApi.get<VehicleDocumentResponse[]>(
    `/bus-companies/${companyId}/vehicles/${vehicleId}/documents`
  );
}
