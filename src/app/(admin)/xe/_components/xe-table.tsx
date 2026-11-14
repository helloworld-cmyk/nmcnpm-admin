"use client";

import { Icon } from "@/components/icons/icon";
import {
  useXeFiltersStore,
  type XeSortKey,
} from "@/global-states/xe-filters-store";
import { pageIndexes } from "@/utils/table";
import type { Xe } from "../_data/vehicles";

const COLUMNS: { label: string; sortKey?: XeSortKey }[] = [
  { label: "Xe", sortKey: "bienSo" },
  { label: "Sức chứa", sortKey: "soCho" },
  { label: "Tình trạng", sortKey: "trangThai" },
  { label: "Thao tác" },
];

const STATUS_BADGE_CLASS: Record<Xe["trangThai"], string> = {
  "Đang hoạt động": "badge--green",
  "Đang bảo trì": "badge--orange",
  "Ngưng sử dụng": "badge--slate",
};

const CELL_ACTION_BASE = [
  "inline-flex min-h-[44px] items-center gap-1.5",
  "rounded-[var(--radius-sm)] px-2.5 text-[13px] font-bold",
  "transition-colors disabled:cursor-not-allowed",
  "disabled:text-[var(--slate-400)] disabled:hover:bg-transparent",
].join(" ");

const CELL_ACTION_EDIT = [
  CELL_ACTION_BASE,
  "text-[var(--sky-700)] hover:bg-[var(--sky-100)]",
  "hover:text-[var(--sky-800)]",
].join(" ");

const CELL_ACTION_SEAT = [
  CELL_ACTION_BASE,
  "text-[var(--slate-600)] hover:bg-[var(--navy-50)]",
  "hover:text-[var(--navy-800)]",
].join(" ");

const CELL_ACTION_DOC = [
  CELL_ACTION_BASE,
  "text-[var(--slate-600)] hover:bg-[var(--sky-50)]",
  "hover:text-[var(--sky-800)]",
].join(" ");

const CELL_ACTION_DELETE = [
  CELL_ACTION_BASE,
  "text-[var(--red-600)] hover:bg-[var(--red-50)]",
  "hover:text-[var(--red-600)]",
].join(" ");

const TH_CLASS = "is-sortable";

const PLATE_CLASS = [
  "block [font-family:var(--font-heading)] text-[14.5px]",
  "font-extrabold tracking-[0.01em] text-[var(--ink)]",
].join(" ");

const SO_CHO_CLASS =
  "inline-flex items-center gap-1.5 font-semibold text-[var(--ink)]";

const ACTIONS_CLASS =
  "flex flex-wrap items-center gap-1.5 max-[640px]:w-full max-[640px]:justify-end";

const PAGE_GAP = "px-0.5 font-bold text-[var(--slate-400)] max-[400px]:hidden";

const TABLE_FOOTER_CLASS = [
  "flex flex-wrap items-center justify-between gap-2.5",
  "border-t border-[var(--border-soft)] px-5 py-3",
].join(" ");

type XeTableProps = {
  rows: Xe[];
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  pageCount: number;
  page: number;
  onEdit: (xe: Xe) => void;
  onDelete: (xe: Xe) => void;
  onSeat: (xe: Xe) => void;
  onDocs: (xe: Xe) => void;
};

export function XeTable({
  rows,
  totalCount,
  rangeStart,
  rangeEnd,
  pageCount,
  page,
  onEdit,
  onDelete,
  onSeat,
  onDocs,
}: XeTableProps) {
  const sortKey = useXeFiltersStore((s) => s.sortKey);
  const sortDir = useXeFiltersStore((s) => s.sortDir);
  const toggleSort = useXeFiltersStore((s) => s.toggleSort);
  const setPage = useXeFiltersStore((s) => s.setPage);

  return (
    <section className="table-card" aria-labelledby="xe-table-title">
      <div className="table-card-head">
        <div>
          <h2 className="table-title" id="xe-table-title">
            Danh sách xe
          </h2>
          <p className="table-sub">
            Tình trạng do quản trị viên cập nhật, không tự đổi theo chuyến.
          </p>
        </div>
      </div>

      <div
        className="table-scroll"
        role="region"
        aria-label="Bảng danh sách xe"
        tabIndex={0}
      >
        <table className="table xe-table">
          <caption className="sr-only">
            Danh sách xe của đội: biển số, sức chứa và tình trạng
          </caption>
          <thead>
            <tr>
              {COLUMNS.map((column) => {
                if (!column.sortKey) {
                  return <th key={column.label} scope="col">{column.label}</th>;
                }
                const active = sortKey === column.sortKey;
                return (
                  <th
                    key={column.label}
                    scope="col"
                    className={`${TH_CLASS}${active ? " is-sorted" : ""}`}
                    aria-sort={
                      active
                        ? sortDir === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column.sortKey as XeSortKey)}
                      className="inline-flex items-center gap-1"
                    >
                      {column.label}
                      {active ? (
                        <Icon
                          name="i-chevron-down"
                          className={`icon h-3 w-3 ${sortDir === "asc" ? "rotate-180" : ""}`}
                        />
                      ) : (
                        <Icon name="i-swap" className="icon h-3 w-3 opacity-50" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((xe) => {
              return (
                <tr key={xe.id}>
                  <td data-label="Xe">
                    <span className={PLATE_CLASS}>{xe.bienSo}</span>
                    <span className="mt-0.5 block text-[12.5px] text-[var(--slate-500)]">
                      {xe.loaiXe}
                    </span>
                  </td>
                  <td data-label="Sức chứa">
                    <span className={SO_CHO_CLASS}>
                      <Icon
                        name="i-users"
                        className="icon h-4 w-4 text-[var(--sky-600)]"
                      />
                      {xe.soCho} chỗ
                    </span>
                  </td>
                  <td data-label="Tình trạng">
                    <span className={`badge ${STATUS_BADGE_CLASS[xe.trangThai]}`}>
                      {xe.trangThai}
                    </span>
                  </td>
                  <td data-label="Thao tác">
                    <div className={ACTIONS_CLASS}>
                      <button
                        type="button"
                        className={CELL_ACTION_EDIT}
                        onClick={() => onEdit(xe)}
                      >
                        <Icon name="i-edit" className="icon h-4 w-4" />
                        Sửa
                      </button>
                      <button
                        type="button"
                        className={CELL_ACTION_SEAT}
                        disabled={xe.trangThai === "Ngưng sử dụng"}
                        title={
                          xe.trangThai === "Ngưng sử dụng"
                            ? "Xe đã ngưng sử dụng — không thể cấu hình ghế"
                            : undefined
                        }
                        onClick={() => onSeat(xe)}
                      >
                        <Icon name="i-grid" className="icon h-4 w-4" />
                        Sơ đồ ghế
                      </button>
                      <button
                        type="button"
                        className={CELL_ACTION_DOC}
                        onClick={() => onDocs(xe)}
                      >
                        <Icon name="i-shield" className="icon h-4 w-4" />
                        Giấy tờ
                      </button>
                      <button
                        type="button"
                        className={CELL_ACTION_DELETE}
                        onClick={() => onDelete(xe)}
                      >
                        <Icon name="i-trash" className="icon h-4 w-4" />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className={TABLE_FOOTER_CLASS}>
          <p className="page-note">
            {rangeStart > 0
              ? `Hiển thị ${rangeStart}–${rangeEnd} của ${totalCount} xe`
              : ""}
          </p>
          <div className="pagination">
            <button
              type="button"
              className="page-btn"
              aria-label="Trang trước"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <Icon name="i-chevron-right" className="icon rotate-180" />
            </button>
            <div className="page-nums">
              {pageIndexes(pageCount, page).map((item, index) =>
                item === "gap" ? (
                  <span key={`gap-${index}`} className={PAGE_GAP} aria-hidden="true">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={`page-btn${item === page ? " is-active" : ""}`}
                    aria-current={item === page ? "page" : undefined}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
            <button
              type="button"
              className="page-btn"
              aria-label="Trang sau"
              disabled={page >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              <Icon name="i-chevron-right" className="icon" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
