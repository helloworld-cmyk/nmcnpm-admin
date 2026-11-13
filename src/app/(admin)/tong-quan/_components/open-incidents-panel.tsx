import Link from "next/link";

import { Icon } from "@/components/icons/icon";

import type { OpenIncidentRow } from "../_utils/map-dashboard";

const ICON_CLASS =
  "grid h-[38px] w-[38px] flex-none place-items-center rounded-[11px] bg-[var(--red-50)] text-[var(--red-600)]";

const ITEM_CLASS =
  "flex items-start gap-3 border-b border-[var(--border-soft)] py-[11px] last:border-b-0";

const META_CLASS = "mt-0.5 text-xs text-[var(--slate-500)]";

const DESC_CLASS = "mt-1 line-clamp-2 text-[13px] text-[var(--slate-600)]";

/*
 * Panel "Sự cố đang mở" — sự cố OPEN/IN_PROGRESS của hãng
 * (GET /bus-companies/{id}/dashboard/open-incidents).
 */
export function OpenIncidentsPanel({ rows }: { rows: OpenIncidentRow[] }) {
  return (
    <article className="tq-panel" aria-labelledby="open-incidents-title">
      <div className="tq-panel-head">
        <div>
          <h2 id="open-incidents-title" className="tq-panel-title">
            Sự cố đang mở
          </h2>
          <p className="tq-panel-sub">
            {rows.length > 0 ? `${rows.length} sự cố cần xử lý` : "Mới nhất trước"}
          </p>
        </div>
        <Link href="/chuyen" className="tq-text-link">
          Xem chuyến
          <Icon name="i-arrow-right" className="icon" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="state-empty">
          <span className="state-empty-icon">
            <Icon name="i-check-circle" className="icon" />
          </span>
          <h3>Không có sự cố</h3>
          <p>Tất cả chuyến đang vận hành bình thường.</p>
        </div>
      ) : (
        <ul>
          {rows.map((incident) => (
            <li key={incident.id} className={ITEM_CLASS}>
              <span className={ICON_CLASS} aria-hidden="true">
                <Icon name="i-alert" className="h-[18px] w-[18px] flex-none" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm font-bold text-[var(--ink)]">
                    {incident.typeLabel}
                  </strong>
                  <span className={`badge ${incident.statusClass}`}>
                    {incident.statusLabel}
                  </span>
                </div>
                <span className={META_CLASS}>
                  {incident.code} · {incident.tripCode} · {incident.driver} ·{" "}
                  {incident.ageLabel} trước
                </span>
                <p className={DESC_CLASS}>{incident.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
