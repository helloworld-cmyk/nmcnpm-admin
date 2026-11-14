"use client";

import { Icon } from "@/components/icons/icon";
import { useTaiXeFiltersStore } from "@/global-states/tai-xe-filters-store";
import { pageIndexes } from "@/utils/table";
import {
  TRANG_THAI_TAI_XE_LABEL,
  daHetHan,
  formatNgay,
  laSapHetHan,
  type TaiXe,
} from "../_utils/tai-xe";

const COLUMNS = [
  "Tài xế",
  "SĐT",
  "Giấy phép",
  "Hạn GPLX",
  "Chuyến",
  "Trạng thái",
  "Thao tác",
] as const;

const CELL_SUB = "mt-0.5 block text-[12px] font-medium text-[var(--slate-400)]";

const COL_HEAD_SUB =
  "mt-0.5 block text-[10px] font-semibold normal-case tracking-normal text-[var(--slate-400)]";

const NUM_CELL =
  "num [font-family:var(--font-heading)] font-bold tracking-[-0.01em] text-[var(--ink)]";

const PAGE_GAP = "px-0.5 font-bold text-[var(--slate-400)] max-[400px]:hidden";

const PAGINATION_BAR =
  "flex flex-wrap items-center justify-between gap-2.5 border-t border-[var(--border-soft)] px-5 py-3";

type TaiXeTableProps = {
  rows: TaiXe[];
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  page: number;
  pageCount: number;
  refreshing: boolean;
  onEdit: (taiXe: TaiXe) => void;
  onToggleStatus: (taiXe: TaiXe) => void;
  onOpenDetail: (taiXe: TaiXe) => void;
};

export function TaiXeTable({
  rows,
  totalCount,
  rangeStart,
  rangeEnd,
  page,
  pageCount,
  refreshing,
  onEdit,
  onToggleStatus,
  onOpenDetail,
}: TaiXeTableProps) {
  const setPage = useTaiXeFiltersStore((s) => s.setPage);

  return (
    <section className="table-card" aria-label="Danh sách tài xế">
      <div
        className="table-scroll"
        role="region"
        aria-label="Bảng danh sách tài xế"
        tabIndex={0}
      >
        <table className="table">
          <caption className="sr-only">
            Tài xế — kèm số điện thoại, giấy phép lái xe, hạn GPLX, số chuyến
            trong 30 ngày và trạng thái tài khoản
          </caption>
          <thead>
            <tr>
              {COLUMNS.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className={label === "Chuyến" ? "num" : undefined}
                >
                  {label}
                  {label === "Chuyến" ? (
                    <span className={COL_HEAD_SUB}>30 ngày</span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((taiXe) => {
              const locked = taiXe.trangThai === "locked";
              const hetHan = daHetHan(taiXe.hanGplx);
              const sapHetHan = !hetHan && laSapHetHan(taiXe.hanGplx);
              return (
                <tr key={taiXe.id} onClick={() => onOpenDetail(taiXe)}>
                  <td data-label="Tài xế">
                    <div className="flex min-w-[190px] flex-col leading-[1.3]">
                      <strong className="font-semibold text-[var(--ink)]">
                        {taiXe.ten}
                      </strong>
                      <span className={CELL_SUB}>{taiXe.email || "—"}</span>
                    </div>
                  </td>
                  <td data-label="SĐT">{taiXe.soDienThoai || "—"}</td>
                  <td data-label="Giấy phép">
                    <span className="flex flex-col leading-[1.3]">
                      <strong className="font-semibold text-[var(--ink)]">
                        {taiXe.hangGplx
                          ? `${taiXe.hangGplx} · ${taiXe.gplx}`
                          : taiXe.gplx}
                      </strong>
                      <span className={CELL_SUB}>Giấy phép lái xe</span>
                    </span>
                  </td>
                  <td data-label="Hạn GPLX">
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {formatNgay(taiXe.hanGplx)}
                      {hetHan ? (
                        <span className="badge badge--red">Đã hết hạn</span>
                      ) : sapHetHan ? (
                        <span className="badge badge--orange">Sắp hết hạn</span>
                      ) : null}
                    </span>
                  </td>
                  <td data-label="Chuyến" className={NUM_CELL}>
                    {taiXe.trips30Days}
                  </td>
                  <td data-label="Trạng thái">
                    <span
                      className={`badge ${locked ? "badge--red" : "badge--green"}`}
                    >
                      <span className="tx-dot" aria-hidden="true" />
                      {TRANG_THAI_TAI_XE_LABEL[taiXe.trangThai]}
                    </span>
                  </td>
                  <td data-label="Thao tác">
                    <div className="tx-actions flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEdit(taiXe);
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleStatus(taiXe);
                        }}
                      >
                        {locked ? "Mở khóa" : "Khóa"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenDetail(taiXe);
                        }}
                      >
                        Chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={PAGINATION_BAR}>
        <p className="page-note">
          {`Hiển thị ${rangeStart}–${rangeEnd} của ${totalCount} tài xế`}
          {refreshing ? (
            <span className="ml-1.5 font-medium text-[var(--slate-400)]">
              · đang cập nhật…
            </span>
          ) : null}
        </p>
        <nav className="pagination" aria-label="Phân trang danh sách">
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
                <span
                  key={`gap-${index}`}
                  className={PAGE_GAP}
                  aria-hidden="true"
                >
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
        </nav>
      </div>
    </section>
  );
}
