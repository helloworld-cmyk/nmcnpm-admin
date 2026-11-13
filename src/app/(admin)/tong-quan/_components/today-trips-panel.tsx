import Link from "next/link";

import { Icon } from "@/components/icons/icon";

import type { TodayTripRow } from "../_utils/map-dashboard";

const COLUMNS = [
  { label: "Mã chuyến" },
  { label: "Tuyến" },
  { label: "Khởi hành" },
  { label: "Tài xế" },
  { label: "Xe" },
  { label: "Trạng thái" },
];

const CODE_CLASS =
  "block [font-family:var(--font-heading)] text-[13px] font-bold text-[var(--ink)]";

const ROUTE_SUB_CLASS = "mt-px block text-[11.5px] text-[var(--slate-400)]";

const TIME_CLASS =
  "inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--slate-700)] tabular-nums";

const LATE_CLASS =
  "inline-flex items-center rounded-full bg-[var(--red-50)] px-2 py-[3px] text-[11px] font-bold text-[var(--red-600)]";

const BADGE_CLASS = "badge";

/*
 * Panel "Chuyến hôm nay" — bảng chuyến khởi hành trong ngày của hãng
 * (GET /bus-companies/{id}/dashboard/today-trips).
 */
export function TodayTripsPanel({ rows }: { rows: TodayTripRow[] }) {
  return (
    <article className="tq-panel" aria-labelledby="today-trips-title">
      <div className="tq-panel-head">
        <div>
          <h2 id="today-trips-title" className="tq-panel-title">
            Chuyến hôm nay
          </h2>
          <p className="tq-panel-sub">
            {rows.length > 0 ? `${rows.length} chuyến khởi hành` : "Theo múi giờ hãng"}
          </p>
        </div>
        <Link href="/chuyen" className="tq-text-link">
          Tất cả chuyến
          <Icon name="i-arrow-right" className="icon" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="state-empty">
          <span className="state-empty-icon">
            <Icon name="i-car" className="icon" />
          </span>
          <h3>Chưa có chuyến hôm nay</h3>
          <p>Hôm nay hãng chưa có chuyến nào khởi hành.</p>
        </div>
      ) : (
        <div className="tq-scroll table-scroll">
          <table className="table">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.label}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((trip) => (
                <tr key={trip.id}>
                  <td>
                    <span className={CODE_CLASS}>{trip.code}</span>
                  </td>
                  <td>
                    <span className="block text-[13.5px] font-semibold text-[var(--slate-700)]">
                      {trip.routeName}
                    </span>
                    <span className={ROUTE_SUB_CLASS}>{trip.routeSub}</span>
                  </td>
                  <td>
                    <span className={TIME_CLASS}>
                      <Icon name="i-clock" className="h-[13px] w-[13px] flex-none" />
                      {trip.time}
                    </span>
                    {trip.lateMinutes > 0 ? (
                      <span className={`${LATE_CLASS} mt-1`}>
                        Trễ {trip.lateMinutes} phút
                      </span>
                    ) : null}
                  </td>
                  <td>{trip.driver}</td>
                  <td>{trip.vehicle}</td>
                  <td>
                    <span className={`${BADGE_CLASS} ${trip.statusClass}`}>
                      {trip.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
