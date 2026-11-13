import Link from "next/link";

import { Icon } from "@/components/icons/icon";

import { formatVnd, type TopRouteRow } from "../_utils/map-dashboard";

const RANK_CLASS =
  "grid h-[30px] w-[30px] flex-none place-items-center rounded-[10px] bg-[var(--sky-50)] [font-family:var(--font-heading)] text-[12.5px] font-extrabold text-[var(--sky-700)]";

const ITEM_CLASS =
  "flex items-center gap-3 border-b border-[var(--border-soft)] py-[11px] last:border-b-0";

const META_CLASS = "mt-0.5 text-xs text-[var(--slate-500)]";

const VALUE_CLASS =
  "[font-family:var(--font-heading)] text-sm font-extrabold whitespace-nowrap tabular-nums text-[var(--ink)]";

const BAR_TRACK_CLASS =
  "mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-soft)]";

const BAR_FILL_CLASS = "block h-full rounded-full bg-[var(--sky-600)]";

/*
 * Panel "Top tuyến" — xếp hạng tuyến theo giá trị vé CONFIRMED
 * (GET /bus-companies/{id}/dashboard/top-routes).
 */
export function TopRoutesPanel({ rows }: { rows: TopRouteRow[] }) {
  return (
    <article className="tq-panel h-full" aria-labelledby="top-routes-title">
      <div className="tq-panel-head">
        <div>
          <h2 id="top-routes-title" className="tq-panel-title">
            Top tuyến
          </h2>
          <p className="tq-panel-sub">Theo giá trị vé đã xác nhận</p>
        </div>
        <Link href="/tuyen-duong" className="tq-text-link">
          Tất cả tuyến
          <Icon name="i-arrow-right" className="icon" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="state-empty">
          <span className="state-empty-icon">
            <Icon name="i-route" className="icon" />
          </span>
          <h3>Chưa có dữ liệu tuyến</h3>
          <p>Chưa có chuyến nào phát sinh giá trị vé trong kỳ.</p>
        </div>
      ) : (
        <ol>
          {rows.map((route, index) => (
            <li key={route.id} className={ITEM_CLASS}>
              <span className={RANK_CLASS} aria-hidden="true">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-bold text-[var(--ink)]">
                  {route.name}
                </strong>
                <span className={META_CLASS}>
                  {route.code} · {route.tripCount} chuyến · {route.passengerCount}{" "}
                  vé
                  {route.occupancy !== null ? ` · lấp ${route.occupancy}%` : ""}
                </span>
                <div className={BAR_TRACK_CLASS} aria-hidden="true">
                  <span
                    className={BAR_FILL_CLASS}
                    style={{ width: `${route.occupancy ?? 0}%` }}
                  />
                </div>
              </div>
              <p className={VALUE_CLASS}>{formatVnd(route.revenue)}</p>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
