import type { TicketStatus } from "@/api/booking/types";

/* Kiểu dữ liệu báo cáo doanh thu dùng chung cho endpoint /bus-companies/{id}/reports/revenue. */

/* Tham số lọc báo cáo doanh thu; ngày định dạng yyyy-MM-dd. */
export type RevenueReportQuery = {
  from?: string;
  to?: string;
  status?: TicketStatus;
  routeId?: string;
};

/* Tham số lọc thực thu theo tuyến hoặc đối soát; ngày định dạng yyyy-MM-dd. */
export type RevenueAnalyticsQuery = {
  from?: string;
  to?: string;
  routeId?: string;
};

/* Giá trị vé của một ngày trong báo cáo. */
export type RevenuePeriodResponse = {
  date: string;
  tickets: number;
  ticketValue: number;
};

/* Thực thu của một ngày. */
export type RevenueDailyResponse = {
  date: string;
  collectedRevenue: number;
};

/* Thực thu theo một tuyến. */
export type RevenueRouteResponse = {
  routeId: string;
  routeName: string;
  collectedRevenue: number;
};

/* Một chuyến trong bảng đối soát thực thu. */
export type RevenueReconciliationTripResponse = {
  tripId: string;
  tripCode: string;
  routeId: string;
  routeName: string;
  departureAt: string;
  bookedTickets: number;
  collectedTickets: number;
  expectedRevenue: number;
  collectedRevenue: number;
  driverWage: number | null;
  difference: number;
};

/* Tổng hợp của bảng đối soát. */
export type RevenueReconciliationTotalsResponse = {
  bookedTickets: number;
  collectedTickets: number;
  collectedRevenue: number;
  driverWages: number | null;
};

/* Đối soát thực thu theo chuyến. */
export type RevenueReconciliationResponse = {
  trips: RevenueReconciliationTripResponse[];
  mismatchedTrips: number;
  totals: RevenueReconciliationTotalsResponse;
};

/* Phân tích thực thu kèm báo cáo doanh thu. */
export type RevenueAnalyticsResponse = {
  collectedRevenue: number;
  previousCollectedRevenue: number;
  collectedRevenueChangePct: number | null;
  bookedTickets: number;
  collectedTickets: number;
  collectionRate: number | null;
  cancelledTickets: number;
  noShowTickets: number;
  completedTrips: number;
  departedTrips: number;
  driverWages: number | null;
  missingDriverWages: number;
  estimatedProfit: number | null;
  days: RevenueDailyResponse[];
  routes: RevenueRouteResponse[];
  reconciliation: RevenueReconciliationResponse;
};

/* Báo cáo giá trị vé theo kỳ. */
export type RevenueReportResponse = {
  from: string | null;
  to: string | null;
  status: TicketStatus;
  tickets: number;
  ticketValue: number;
  previousFrom: string | null;
  previousTo: string | null;
  previousRevenue: number;
  previousTickets: number;
  revenueChangePct: number | null;
  ticketsChangePct: number | null;
  currency: string;
  actualCollected: boolean;
  note: string;
  periods: RevenuePeriodResponse[];
  analytics: RevenueAnalyticsResponse;
};
