import type { RouteResponse } from "@/api/tuyen-duong/api/types";
import type { TuyenDuong } from "../_data/tuyen-duong";

/* Định dạng updatedAt (ISO) về dd/MM/yyyy; trả nguyên chuỗi nếu không parse được. */
function formatUpdated(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

/* Map một tuyến từ backend sang view-model dùng bởi bảng/modal. */
export function mapRoute(route: RouteResponse, trips = 0): TuyenDuong {
  return {
    id: route.id,
    code: route.code,
    from: route.originAreaName,
    to: route.destinationAreaName,
    km: route.distanceKm,
    min: route.durationMinutes,
    price: route.baseFareAmount,
    active: route.status === "ACTIVE",
    trips,
    updated: formatUpdated(route.updatedAt),
  };
}

/* Map danh sách tuyến; đắp số chuyến theo tuyến từ API /trips (join theo id). */
export function mapRoutes(
  routes: RouteResponse[],
  tripCountByRoute: Record<string, number> = {}
): TuyenDuong[] {
  return routes.map((route) => mapRoute(route, tripCountByRoute[route.id] ?? 0));
}
