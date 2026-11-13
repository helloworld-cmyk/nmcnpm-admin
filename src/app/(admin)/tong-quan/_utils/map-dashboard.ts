import type { TripStatus } from "@/api/chuyen/api/types";
import type {
  DashboardDriverResponse,
  DashboardIncidentResponse,
  DashboardRouteResponse,
  DashboardSummaryResponse,
  DashboardTodayTripResponse,
  DashboardTripPointResponse,
  IncidentStatus,
} from "@/api/tong-quan/api/types";

import type { ChartPoint, StatKpi, TrendTone } from "../_data/tong-quan";

export function formatVnd(value: number): string {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function rangeLabel(from: string | null, to: string | null): string {
  if (!from || !to) return "Toàn bộ kỳ";
  return `Kỳ ${from} – ${to}`;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function dayLabel(iso: string): string {
  const [, month, day] = iso.split("-");
  if (!month || !day) return iso;
  return `${day}/${month}`;
}

/*
 * Nhãn xu hướng của một chỉ số so với kỳ trước, dựa trên % thay đổi backend trả.
 * `invert` dùng cho chỉ số mà tăng là xấu (ví dụ chuyến đã huỷ).
 */
function changePill(
  pct: number | null | undefined,
  invert = false
): { trend: TrendTone; trendIcon: string; trendText: string } {
  if (pct === null || pct === undefined || Number.isNaN(pct)) {
    return { trend: "muted", trendIcon: "i-chart", trendText: "Chưa có kỳ trước" };
  }
  const up = pct >= 0;
  return {
    trend: up !== invert ? "good" : "bad",
    trendIcon: up ? "i-trending-up" : "i-trending-down",
    trendText: `${up ? "+" : ""}${Math.round(pct)}%`,
  };
}

/* DashboardSummaryResponse → 6 thẻ KPI của màn Tổng quan (kèm so sánh kỳ trước). */
export function mapSummaryToKpis(summary: DashboardSummaryResponse): StatKpi[] {
  const total = summary.totalTrips;
  const share = (count: number) =>
    total > 0 ? `${Math.round((count / total) * 100)}% tổng chuyến` : "—";

  return [
    {
      id: "total-trips",
      label: "Tổng chuyến",
      icon: "i-car",
      iconTone: "sky",
      value: String(total),
      ...changePill(summary.totalTripsChangePct),
      delta: `${summary.completedTrips} hoàn thành · ${rangeLabel(summary.from, summary.to)}`,
    },
    {
      id: "in-progress",
      label: "Đang thực hiện",
      icon: "i-clock",
      iconTone: "orange",
      value: String(summary.inProgressTrips),
      ...changePill(summary.inProgressTripsChangePct),
      delta: share(summary.inProgressTrips),
    },
    {
      id: "scheduled",
      label: "Đã lên lịch",
      icon: "i-calendar",
      iconTone: "navy",
      value: String(summary.scheduledTrips),
      ...changePill(summary.scheduledTripsChangePct),
      delta: share(summary.scheduledTrips),
    },
    {
      id: "completed",
      label: "Hoàn thành",
      icon: "i-check-circle",
      iconTone: "green",
      value: String(summary.completedTrips),
      ...changePill(summary.completedTripsChangePct),
      delta: share(summary.completedTrips),
    },
    {
      id: "cancelled",
      label: "Đã huỷ",
      icon: "i-x-circle",
      iconTone: "navy",
      value: String(summary.cancelledTrips),
      ...changePill(summary.cancelledTripsChangePct, true),
      delta: share(summary.cancelledTrips),
    },
    {
      id: "tickets",
      label: "Vé đã xác nhận",
      icon: "i-ticket",
      iconTone: "navy",
      value: String(summary.confirmedTickets),
      ...changePill(summary.confirmedTicketsChangePct),
      delta: formatVnd(summary.confirmedTicketValue),
    },
  ];
}

/*
 * DashboardTripPointResponse[] → điểm biểu đồ. Doanh thu theo ngày lấy trực tiếp
 * từ trường `revenue` (VND) của backend, quy đổi sang triệu đồng cho khớp trục.
 */
export function mapTripPointsToChart(
  points: DashboardTripPointResponse[]
): ChartPoint[] {
  return points.map((point, index) => ({
    label: dayLabel(point.date),
    revenue: point.revenue / 1_000_000,
    trips: point.totalTrips,
    today: index === points.length - 1,
  }));
}

export type TopDriverRow = {
  id: string;
  initials: string;
  name: string;
  assigned: number;
  completed: number;
  revenue: number;
  rating: number | null;
};

/* DashboardDriverResponse[] → view-model bảng top tài xế. */
export function mapTopDrivers(
  drivers: DashboardDriverResponse[]
): TopDriverRow[] {
  return drivers.map((driver) => ({
    id: driver.driverId,
    initials: initials(driver.driverName),
    name: driver.driverName,
    assigned: driver.assignedTrips,
    completed: driver.completedTrips,
    revenue: driver.revenue,
    rating: driver.rating,
  }));
}

/* ---------- Chuyến hôm nay ---------- */

const TRIP_STATUS_META: Record<TripStatus, { label: string; badge: string }> = {
  DRAFT: { label: "Nháp", badge: "badge--slate" },
  SCHEDULED: { label: "Sắp tới", badge: "badge--sky" },
  IN_PROGRESS: { label: "Đang chạy", badge: "badge--orange" },
  COMPLETED: { label: "Hoàn thành", badge: "badge--green" },
  CANCELLED: { label: "Đã huỷ", badge: "badge--slate" },
  TERMINATED: { label: "Dừng sớm", badge: "badge--red" },
};

export type TodayTripRow = {
  id: string;
  code: string;
  routeName: string;
  routeSub: string;
  time: string;
  driver: string;
  vehicle: string;
  statusLabel: string;
  statusClass: string;
  lateMinutes: number;
};

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/*
 * Chuyến được coi là đã phân công khi có tài xế và phân công không bị từ chối
 * hoặc thay thế (backend xem REJECTED/REPLACED như chưa phân công).
 */
function driverLabel(trip: DashboardTodayTripResponse): string {
  const status = trip.assignmentStatus;
  const valid =
    trip.driverName !== null &&
    status !== null &&
    status !== "REJECTED" &&
    status !== "REPLACED";
  return valid ? (trip.driverName as string) : "Chưa phân công";
}

/* DashboardTodayTripResponse[] → view-model bảng chuyến hôm nay. */
export function mapTodayTrips(
  trips: DashboardTodayTripResponse[]
): TodayTripRow[] {
  return trips.map((trip) => {
    const meta = TRIP_STATUS_META[trip.tripStatus];
    return {
      id: trip.tripId,
      code: trip.tripCode,
      routeName: trip.routeName,
      routeSub: `${trip.originAreaName} → ${trip.destinationAreaName}`,
      time: timeLabel(trip.departureAt),
      driver: driverLabel(trip),
      vehicle: trip.vehiclePlate ?? "—",
      statusLabel: meta.label,
      statusClass: meta.badge,
      lateMinutes: trip.lateMinutes ?? 0,
    };
  });
}

/* ---------- Top tuyến ---------- */

export type TopRouteRow = {
  id: string;
  code: string;
  name: string;
  tripCount: number;
  passengerCount: number;
  revenue: number;
  occupancy: number | null;
};

/* DashboardRouteResponse[] → view-model bảng top tuyến. */
export function mapTopRoutes(routes: DashboardRouteResponse[]): TopRouteRow[] {
  return routes.map((route) => ({
    id: route.routeId,
    code: route.routeCode,
    name: route.routeName,
    tripCount: route.tripCount,
    passengerCount: route.passengerCount,
    revenue: route.revenue,
    occupancy:
      route.occupancyRate === null
        ? null
        : Math.round(route.occupancyRate * 100),
  }));
}

/* ---------- Sự cố đang mở ---------- */

const INCIDENT_STATUS_META: Record<IncidentStatus, { label: string; badge: string }> = {
  OPEN: { label: "Mới", badge: "badge--red" },
  IN_PROGRESS: { label: "Đang xử lý", badge: "badge--orange" },
  RESOLVED: { label: "Đã xử lý", badge: "badge--green" },
  CLOSED: { label: "Đã đóng", badge: "badge--slate" },
};

export type OpenIncidentRow = {
  id: string;
  code: string;
  typeLabel: string;
  tripCode: string;
  driver: string;
  description: string;
  ageLabel: string;
  statusLabel: string;
  statusClass: string;
};

function ageLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  return `${Math.floor(hours / 24)} ngày`;
}

/*
 * DashboardIncidentResponse[] → view-model danh sách sự cố đang mở.
 * Nhãn loại sự cố dùng `typeLabel` do backend trả (đã là tiếng Việt).
 */
export function mapOpenIncidents(
  incidents: DashboardIncidentResponse[]
): OpenIncidentRow[] {
  return incidents.map((incident) => {
    const meta = INCIDENT_STATUS_META[incident.status];
    return {
      id: incident.incidentId,
      code: incident.incidentCode,
      typeLabel: incident.typeLabel,
      tripCode: incident.tripCode,
      driver: incident.driverName ?? "Không rõ",
      description: incident.description,
      ageLabel: ageLabel(incident.ageMinutes),
      statusLabel: meta.label,
      statusClass: meta.badge,
    };
  });
}
