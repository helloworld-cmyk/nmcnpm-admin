/* Kiểu dữ liệu tuyến đường dùng chung cho các endpoint /bus-companies/{id}/routes. */

/* Trạng thái hoạt động của tuyến. */
export type RouteStatus = "ACTIVE" | "INACTIVE";

/* Thông tin tuyến đường của hãng. */
export type RouteResponse = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  originAreaId: string;
  originAreaCode: string;
  originAreaName: string;
  destinationAreaId: string;
  destinationAreaCode: string;
  destinationAreaName: string;
  distanceKm: number;
  durationMinutes: number;
  baseFareAmount: number;
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
};

/* Body tạo tuyến mới (POST /bus-companies/{id}/routes). Không gửi `name` — BE tự sinh từ 2 khu vực. */
export type CreateRoutePayload = {
  code: string;
  originAreaId: string;
  destinationAreaId: string;
  distanceKm: number;
  durationMinutes: number;
  baseFareAmount: number;
};

/* Body cập nhật tuyến; trường không gửi được giữ nguyên. Không gửi `name` — BE tự sinh từ 2 khu vực. */
export type UpdateRoutePayload = {
  code?: string;
  originAreaId?: string;
  destinationAreaId?: string;
  distanceKm?: number;
  durationMinutes?: number;
  baseFareAmount?: number;
  status?: RouteStatus;
};

