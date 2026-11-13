import { authApi } from "../../method";
import { wrapRequest } from "../../types";

import type {
  VehicleDocumentPayload,
  VehicleDocumentResponse,
  VehicleDocumentType,
} from "./types";

/* Gọi API thêm hoặc cập nhật một loại giấy tờ của xe (upsert theo type). */
export function putVehicleDocumentAPI(
  companyId: string,
  vehicleId: string,
  type: VehicleDocumentType,
  payload: VehicleDocumentPayload
): Promise<VehicleDocumentResponse> {
  return authApi.put<VehicleDocumentResponse>(
    `/bus-companies/${companyId}/vehicles/${vehicleId}/documents/${type}`,
    wrapRequest(payload)
  );
}
