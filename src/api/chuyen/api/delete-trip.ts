import { authApi } from "../../method";

/* Gọi API xóa chuyến nháp (chỉ chuyến DRAFT đang đóng bán, chưa có lịch sử). */
export function deleteTripAPI(
  companyId: string,
  tripId: string
): Promise<void> {
  return authApi.delete<void>(
    `/bus-companies/${companyId}/trips/${tripId}`
  );
}
