"use client";

import { Icon } from "@/components/icons/icon";
import {
  useXeFiltersStore,
  type XeSortKey,
} from "@/global-states/xe-filters-store";
import {
  formatDocDate,
  isDocExpiringSoon,
  type Xe,
} from "../_data/vehicles";

const COLUMNS: { label: string; sortKey?: XeSortKey }[] = [
  { label: "Xe", sortKey: "bienSo" },
  { label: "Sức chứa", sortKey: "soCho" },
  { label: "Tài xế phụ trách", sortKey: "taiXe" },
  { label: "Giấy tờ" },
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

const CELL_ACTION_DELETE = [
  CELL_ACTION_BASE,
  "text-[var(--red-600)] hover:bg-[var(--red-50)]",
  "hover:text-[var(--red-600)]",
].join(" ");

const DOC_CLASS =
  "flex items-center gap-[5px] text-[12.5px] leading-[1.5] text-[var(--slate-500)]";

const DOC_WARN_CLASS = "font-semibold text-[var(--orange-700)]";

const TH_CLASS = "is-sortable";

const PLATE_CLASS = [
  "block [font-family:var(--font-heading)] text-[14.5px]",
  "font-extrabold tracking-[0.01em] text-[var(--ink)]",
].join(" ");

const SO_CHO_CLASS =
  "inline-flex items-center gap-1.5 font-semibold text-[var(--ink)]";

const ACTIONS_CLASS =
  "flex items-center gap-1.5 max-[640px]:w-full max-[640px]:justify-end";

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
}: XeTableProps) {
  const sortKey = useXeFiltersStore((s) => s.sortKey);
  const sortDir = useXeFiltersStore((s) => s.sortDir);
  const toggleSort = useXeFiltersStore((s) => s.toggleSort);
  const setPage = useXeFiltersStore((s) => s.setPage);

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <section className="table-card" aria-labelledby="xe-table-title">
      <div className="table-card-head">
        <div>
          <h2 className="table-title" id="xe-table-title">
            Danh sách xe
          </h2>
          <p className="table-sub">
            Tình trạng và giấy tờ cập nhật sau mỗi chuyến hoàn thành.
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
            Danh sách xe của đội: biển số, sức chứa, tài xế phụ trách, giấy tờ
            và tình trạng
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
              const docs = [
                { ten: "Đăng kiểm", hetHan: xe.dangKiem },
                { ten: "Bảo hiểm", hetHan: xe.baoHiem },
              ];
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
                  <td data-label="Tài xế phụ trách">
                    {xe.taiXe ?? (
                      <span className="text-[var(--slate-400)]">— Chưa gán</span>
                    )}
                  </td>
                  <td data-label="Giấy tờ">
                    {docs.map((doc) => {
                      const warning = isDocExpiringSoon(doc.hetHan);
                      return (
                        <p
                          key={doc.ten}
                          className={`${DOC_CLASS}${warning ? ` ${DOC_WARN_CLASS}` : ""}`}
                        >
                          {warning && (
                            <Icon
                              name="i-alert"
                              className="icon h-3.5 w-3.5 flex-none text-[var(--orange-600)]"
                            />
                          )}
                          {doc.ten} · {formatDocDate(doc.hetHan, warning)}
                        </p>
                      );
                    })}
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
                        className={CELL_ACTION_DELETE}
                        disabled={xe.daGanChuyen}
                        title={
                          xe.daGanChuyen
                            ? "Xe đã gắn chuyến — chỉ có thể ngưng sử dụng"
                            : undefined
                        }
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
              {pages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`page-btn${pageNumber === page ? " is-active" : ""}`}
                  aria-current={pageNumber === page ? "page" : undefined}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
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
