import type { TicketStatus } from "@/api/booking/types";

/* Kiểu dữ liệu báo cáo doanh thu dùng chung cho endpoint /bus-companies/{id}/reports/revenue. */

/* Tham số lọc báo cáo doanh thu; ngày định dạng yyyy-MM-dd. */
export type RevenueReportQuery = {
  from?: string;
  to?: string;
  status?: TicketStatus;
};

/* Giá trị vé của một ngày trong báo cáo. */
export type RevenuePeriodResponse = {
  date: string;
  tickets: number;
  ticketValue: number;
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
};
