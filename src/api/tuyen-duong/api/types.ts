/* Kiểu dữ liệu tuyến đường dùng chung cho các endpoint /bus-companies/{id}/routes. */

/* Trạng thái hoạt động của tuyến. */
export type RouteStatus = "ACTIVE" | "INACTIVE";

/* Điểm dừng mẫu thuộc tuyến. */
export type RouteStopResponse = {
  id: string;
  stopId: string;
  stopName: string;
  address: string;
  areaId: string;
  areaName: string;
  sequenceNo: number;
  arrivalOffsetMinutes: number | null;
  departureOffsetMinutes: number | null;
  pickupAllowed: boolean;
  dropoffAllowed: boolean;
};

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
  stops: RouteStopResponse[];
  createdAt: string;
  updatedAt: string;
};

/* Body tạo tuyến mới (POST /bus-companies/{id}/routes). */
export type CreateRoutePayload = {
  code: string;
  name: string;
  originAreaId: string;
  destinationAreaId: string;
  distanceKm: number;
  durationMinutes: number;
  baseFareAmount: number;
};

/* Body cập nhật tuyến; trường không gửi được giữ nguyên. */
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

/* Một điểm dừng mẫu khi thay thế toàn bộ danh sách điểm của tuyến. */
export type RouteStopInput = {
  stopId: string;
  sequenceNo: number;
  arrivalOffsetMinutes?: number;
  departureOffsetMinutes?: number;
  pickupAllowed: boolean;
  dropoffAllowed: boolean;
};

/* Body thay thế điểm dừng của tuyến (PUT /bus-companies/{id}/routes/{routeId}/stops). */
export type ReplaceRouteStopsPayload = {
  stops: RouteStopInput[];
};