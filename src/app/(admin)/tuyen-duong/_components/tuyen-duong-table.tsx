"use client";

import { Icon } from "@/components/icons/icon";
import { useTuyenDuongFiltersStore } from "@/global-states/tuyen-duong-filters-store";
import { pageIndexes } from "@/utils/table";
import {
  formatDuration,
  formatMoney,
  type TuyenDuong,
} from "../_data/tuyen-duong";

const ROUTE_MARK_CLASS =
  "grid h-9 w-9 flex-none place-items-center rounded-[var(--radius-sm)] bg-[var(--sky-50)] text-[var(--sky-700)] shadow-[inset_0_0_0_1px_rgba(2,132,199,0.16)]";

const CELL_STRONG_CLASS = "font-semibold text-[var(--ink)]";

const CELL_SUB_CLASS =
  "mt-0.5 block text-[12px] font-medium leading-[1.4] text-[var(--slate-400)]";

const NUM_CELL_CLASS =
  "num [font-family:var(--font-heading)] font-bold tracking-[-0.01em] text-[var(--ink)]";

const STATUS_CELL_CLASS = "inline-flex items-center gap-2.5";

const SWITCH_CLASS =
  "relative h-11 w-[46px] flex-none before:absolute before:inset-x-0 before:top-[9px] before:h-[26px] before:rounded-full before:content-[''] before:transition-colors after:absolute after:left-[3px] after:top-[12px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-[var(--shadow-xs)] after:content-[''] after:transition-transform";

const SWITCH_ON_CLASS = "before:bg-[var(--green-600)] after:translate-x-5";

const SWITCH_OFF_CLASS = "before:bg-[var(--slate-300)]";

const PAGE_GAP_CLASS =
  "px-0.5 font-bold text-[var(--slate-400)] max-[400px]:hidden";

type TuyenDuongTableProps = {
  rows: TuyenDuong[];
  page: number;
  pageCount: number;
  onToggle: (route: TuyenDuong) => void;
  onEdit: (route: TuyenDuong) => void;
};

export function TuyenDuongTable({
  rows,
  page,
  pageCount,
  onToggle,
  onEdit,
}: TuyenDuongTableProps) {
  const setPage = useTuyenDuongFiltersStore((s) => s.setPage);

  return (
    <section className="grid gap-3.5" aria-label="Danh sách tuyến đường">
      <div className="table-card">
        <div
          className="table-scroll"
          role="region"
          aria-label="Bảng danh sách tuyến đường"
          tabIndex={0}
        >
          <table className="table td-table">
            <caption className="sr-only">
              Danh sách tuyến đường — kèm quãng đường, thời lượng dự kiến,
              giá vé cơ bản, số chuyến đã tạo và trạng thái hoạt động
            </caption>
            <thead>
              <tr>
                <th scope="col">Tuyến</th>
                <th scope="col">Quãng đường</th>
                <th scope="col" className="num">
                  Giá vé
                </th>
                <th scope="col" className="num">
                  Chuyến
                </th>
                <th scope="col">Trạng thái</th>
                <th scope="col">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((route) => (
                <tr key={route.id}>
                  <td data-label="Tuyến">
                    <div className="flex min-w-[220px] items-center gap-[11px]">
                      <span className={ROUTE_MARK_CLASS}>
                        <Icon name="i-route" className="icon h-[18px] w-[18px]" />
                      </span>
                      <span className="flex flex-col leading-[1.3]">
                        <strong className={CELL_STRONG_CLASS}>
                          {route.from} → {route.to}
                        </strong>
                        <span className={CELL_SUB_CLASS}>
                          {route.code} · cập nhật {route.updated}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td data-label="Quãng đường">
                    <span className={`block ${CELL_STRONG_CLASS}`}>
                      {route.km} km
                    </span>
                    <span className={CELL_SUB_CLASS}>
                      ≈ {formatDuration(route.min)}
                    </span>
                  </td>
                  <td className={NUM_CELL_CLASS} data-label="Giá vé">
                    {formatMoney(route.price)}
                  </td>
                  <td className={NUM_CELL_CLASS} data-label="Chuyến">
                    {route.trips}
                  </td>
                  <td data-label="Trạng thái">
                    <span className={STATUS_CELL_CLASS}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={route.active}
                        aria-label={
                          route.active
                            ? `Ngừng tuyến ${route.code}`
                            : `Kích hoạt tuyến ${route.code}`
                        }
                        className={`${SWITCH_CLASS} ${route.active ? SWITCH_ON_CLASS : SWITCH_OFF_CLASS}`}
                        onClick={() => onToggle(route)}
                      />
                      <span
                        className={`badge ${route.active ? "badge--green" : "badge--orange"}`}
                      >
                        {route.active ? "Đang chạy" : "Tạm dừng"}
                      </span>
                    </span>
                  </td>
                  <td
                    className="whitespace-nowrap text-right"
                    data-label="Thao tác"
                  >
                    <div className="flex items-center justify-end gap-2 max-[640px]:w-full">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => onEdit(route)}
                      >
                        <Icon name="i-edit" />
                        Sửa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <nav className="pagination" aria-label="Phân trang danh sách tuyến">
        <button
          type="button"
          className="page-btn"
          aria-label="Trang trước"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          <Icon name="i-arrow-right" className="icon rotate-180" />
        </button>
        <span className="page-nums">
          {pageIndexes(pageCount, page).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className={PAGE_GAP_CLASS} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`page-btn${item === page ? " is-active" : ""}`}
                aria-label={`Trang ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => setPage(item)}
              >
                {item}
              </button>
            )
          )}
        </span>
        <button
          type="button"
          className="page-btn"
          aria-label="Trang sau"
          disabled={page >= pageCount}
          onClick={() => setPage(page + 1)}
        >
          <Icon name="i-arrow-right" className="icon" />
        </button>
      </nav>
    </section>
  );
}
