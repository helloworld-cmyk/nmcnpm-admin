import { authApi } from "../../method";

/* Gọi API ngừng hoặc xóa xe khỏi hãng. */
export function deleteVehicleAPI(
  companyId: string,
  vehicleId: string
): Promise<void> {
  return authApi.delete<void>(
    `/bus-companies/${companyId}/vehicles/${vehicleId}`
  );
}
