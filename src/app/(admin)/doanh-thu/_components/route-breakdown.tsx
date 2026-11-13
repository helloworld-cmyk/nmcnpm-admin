"use client";

import { Icon } from "@/components/icons/icon";
import { formatVND } from "../_data/doanh-thu";
import { useDoanhThuByRoute } from "../_hooks/use-doanh-thu-by-route";

const ROW =
  "flex flex-col gap-2 border-b border-[var(--border-soft)] py-3.5 last:border-b-0 last:pb-0 first:pt-0";
const ROW_HEAD = "flex items-baseline justify-between gap-3";
const ROUTE_NAME = "text-[13.5px] font-semibold text-[var(--ink)]";
const ROUTE_VALUE =
  "text-[13.5px] font-bold text-[var(--ink)] [font-variant-numeric:tabular-nums] whitespace-nowrap";
const TRACK =
  "h-2 w-full overflow-hidden rounded-full bg-[var(--slate-100)]";
const FILL = "h-full rounded-full bg-[var(--sky-500)]";
const META = "text-[12px] font-medium text-[var(--slate-500)]";

export function RouteBreakdown() {
  const { companyId, rows, total, isLoading, isError, error, refetch } =
    useDoanhThuByRoute();

  return (
    <article className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Doanh thu theo tuyến</h2>
          <p>Tổng tiền thực thu trong kỳ</p>
        </div>
      </div>
      <div className="admin-card-body">
        {companyId.length === 0 ? (
          <div className="state-empty">
            <span className="state-empty-icon">
              <Icon name="i-alert" className="icon" />
            </span>
            <h3>Chưa chọn hãng quản lý</h3>
            <p>Chọn hãng đang quản lý để xem doanh thu theo tuyến.</p>
          </div>
        ) : isLoading ? (
          <div className="state-loading">Đang tải doanh thu theo tuyến...</div>
        ) : isError ? (
          <div className="state-empty">
            <span className="state-empty-icon text-[var(--red-600)]">
              <Icon name="i-alert" className="icon" />
            </span>
            <h3>Không tải được doanh thu theo tuyến</h3>
            <p>
              {error instanceof Error
                ? error.message
                : "Đã xảy ra lỗi khi tải dữ liệu."}
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => void refetch()}
            >
              <Icon name="i-refresh" />
              Thử lại
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="state-empty">
            <span className="state-empty-icon">
              <Icon name="i-route" className="icon" />
            </span>
            <h3>Chưa có dữ liệu theo tuyến</h3>
            <p>Không có tuyến nào phát sinh thực thu trong kỳ đã chọn.</p>
          </div>
        ) : (
          <ul aria-label="Doanh thu theo tuyến">
            {rows.map((row) => (
              <li key={row.routeId} className={ROW}>
                <div className={ROW_HEAD}>
                  <span className={ROUTE_NAME}>{row.routeName}</span>
                  <span className={ROUTE_VALUE}>
                    {formatVND(row.collectedRevenue)}
                  </span>
                </div>
                <div className={TRACK}>
                  <div
                    className={FILL}
                    style={{ width: `${Math.max(row.share * 100, 2)}%` }}
                  />
                </div>
                <span className={META}>
                  {Math.round(row.share * 100)}% tổng thực thu
                </span>
              </li>
            ))}
          </ul>
        )}

        {rows.length > 0 && !isLoading && !isError ? (
          <p className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-[13px] font-bold text-[var(--ink)]">
            <span>Tổng cộng</span>
            <span className="[font-variant-numeric:tabular-nums]">
              {formatVND(total)}
            </span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
