import Link from "next/link";

import { Icon } from "@/components/icons/icon";

import type { TopDriverRow } from "../_utils/map-dashboard";

const AVATAR_TILE_CLASS =
  "grid h-[38px] w-[38px] flex-none place-items-center rounded-full bg-[var(--sky-100)] [font-family:var(--font-heading)] text-[12.5px] font-bold uppercase text-[var(--sky-700)]";

const ITEM_CLASS = "flex items-center gap-3 py-[11px]";

const META_CLASS =
  "mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--slate-500)]";

const COUNT_CLASS =
  "[font-family:var(--font-heading)] text-sm font-extrabold whitespace-nowrap tabular-nums text-[var(--ink)]";

export function TopDriversPanel({ drivers }: { drivers: TopDriverRow[] }) {
  return (
    <article className="tq-panel" aria-labelledby="drivers-title">
      <div className="tq-panel-head">
        <div>
          <h2 id="drivers-title" className="tq-panel-title">
            Top tài xế
          </h2>
          <p className="tq-panel-sub">Theo số chuyến được phân công</p>
        </div>
        <Link href="/tai-xe" className="tq-text-link">
          Tất cả tài xế
          <Icon name="i-arrow-right" className="icon" />
        </Link>
      </div>

      {drivers.length === 0 ? (
        <div className="state-empty">
          <span className="state-empty-icon">
            <Icon name="i-user-check" className="icon" />
          </span>
          <h3>Chưa có phân công</h3>
          <p>Chưa có tài xế nào được phân công chuyến trong kỳ đã chọn.</p>
        </div>
      ) : (
        <ol className="divide-y divide-[var(--border-soft)]">
          {drivers.map((driver) => (
            <li key={driver.id} className={ITEM_CLASS}>
              <span className={AVATAR_TILE_CLASS} aria-hidden="true">
                {driver.initials}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <strong className="text-sm font-bold text-[var(--ink)]">
                  {driver.name}
                </strong>
                <span className={META_CLASS}>
                  <Icon name="i-check" className="h-[13px] w-[13px] flex-none" />
                  {driver.completed} chuyến hoàn thành
                </span>
              </div>
              <p className={COUNT_CLASS}>{driver.assigned} chuyến</p>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
