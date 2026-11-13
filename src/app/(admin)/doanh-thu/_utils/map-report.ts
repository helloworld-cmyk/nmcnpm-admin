import type { RevenueReportResponse } from "@/api/doanh-thu/api/types";

/* Định dạng ngày yyyy-MM-dd thành dd/mm. */
function shortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  if (!month || !day) return iso;
  return `${day}/${month}`;
}

/* Nhãn khoảng kỳ từ hai mốc yyyy-MM-dd. */
function rangeLabel(from: string, to: string): string {
  if (!from || !to) return "toàn bộ kỳ";
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  if (sameMonth) {
    return `${from.slice(8, 10)}–${to.slice(8, 10)}/${to.slice(5, 7)}/${to.slice(0, 4)}`;
  }
  return `${shortDate(from)}/${from.slice(0, 4)}–${shortDate(to)}/${to.slice(0, 4)}`;
}

export type DoanhThuDay = { date: string; label: string; vnd: number };

export type ChangeTone = "up" | "down";

export type DoanhThuChange = { text: string; tone: ChangeTone };

/*
 * Nhãn so sánh với kỳ trước từ % thay đổi backend trả; null khi chưa có kỳ trước.
 */
export function changeVsPrevious(
  pct: number | null | undefined
): DoanhThuChange | null {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return null;
  const up = pct >= 0;
  return {
    text: `${up ? "+" : ""}${Math.round(pct)}% so với kỳ trước`,
    tone: up ? "up" : "down",
  };
}

export type DoanhThuReport = {
  from: string;
  to: string;
  rangeLabel: string;
  previousRangeLabel: string | null;
  note: string;
  actualCollected: boolean;
  tickets: number;
  ticketValue: number;
  revenueChange: DoanhThuChange | null;
  ticketsChange: DoanhThuChange | null;
  days: DoanhThuDay[];
};

/* RevenueReportResponse → view-model màn Doanh thu. */
export function mapRevenueReport(report: RevenueReportResponse): DoanhThuReport {
  const from = report.from ?? "";
  const to = report.to ?? "";
  return {
    from,
    to,
    rangeLabel: rangeLabel(from, to),
    previousRangeLabel:
      report.previousFrom && report.previousTo
        ? rangeLabel(report.previousFrom, report.previousTo)
        : null,
    note: report.note,
    actualCollected: report.actualCollected,
    tickets: report.tickets,
    ticketValue: report.ticketValue,
    revenueChange: changeVsPrevious(report.revenueChangePct),
    ticketsChange: changeVsPrevious(report.ticketsChangePct),
    days: report.periods.map((period) => ({
      date: period.date,
      label: shortDate(period.date),
      vnd: period.ticketValue,
    })),
  };
}
