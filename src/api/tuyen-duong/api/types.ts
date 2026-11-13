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
  /* Tổng số chuyến đã tạo cho tuyến, gồm mọi trạng thái. */
  tripCount: number;
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
};

/*
 * Body tạo tuyến mới (POST /bus-companies/{id}/routes).
 * `name` là bắt buộc ở backend — FE suy ra từ tên điểm đi – điểm đến đang chọn.
 */
export type CreateRoutePayload = {
  code: string;
  name: string;
  originAreaId: string;
  destinationAreaId: string;
  distanceKm: number;
  durationMinutes: number;
  baseFareAmount: number;
};

/*
 * Body cập nhật tuyến; trường không gửi được giữ nguyên.
 * Gửi kèm `name` (suy ra từ 2 khu vực) khi đổi điểm đi/điểm đến để backend ghi đè.
 */
export type UpdateRoutePayload = {
  code?: string;
  name?: string;
  originAreaId?: string;
  destinationAreaId?: string;
  distanceKm?: number;
  durationMinutes?: number;
  baseFareAmount?: number;
  status?: RouteStatus;
};

