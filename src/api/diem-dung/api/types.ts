/* Kiểu dữ liệu điểm đón/trả dùng chung cho các endpoint /bus-companies/{id}/stops. */

/* Trạng thái hoạt động của điểm đón/trả. */
export type StopStatus = "ACTIVE" | "INACTIVE";

/* Thông tin điểm đón/trả của hãng. */
export type StopResponse = {
  id: string;
  companyId: string;
  areaId: string;
  areaCode: string;
  areaName: string;
  name: string;
  address: string;
  pickupInstructions: string | null;
  status: StopStatus;
  createdAt: string;
  updatedAt: string;
};

/* Body tạo điểm đón/trả mới (POST /bus-companies/{id}/stops). */
export type CreateStopPayload = {
  areaId: string;
  name: string;
  address: string;
  pickupInstructions?: string;
};