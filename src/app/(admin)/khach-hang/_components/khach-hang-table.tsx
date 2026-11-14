"use client";

import { Icon } from "@/components/icons/icon";
import {
  useKhachHangFiltersStore,
  type KhachHangSortKey,
} from "@/global-states/khach-hang-filters-store";
import { pageIndexes } from "@/utils/table";
import {
  TRANG_THAI_TAI_KHOAN_BADGE,
  TRANG_THAI_TAI_KHOAN_LABEL,
  laTaiKhoanBiKhoa,
  vietTatHoTen,
  type KhachHang,
} from "../_data/customers";
import { tachEmail } from "../_utils/tach-email";

const COLUMNS: {
  label: string;
  num?: boolean;
  sortKey?: KhachHangSortKey;
}[] = [
  { label: "Khách hàng", sortKey: "ten" },
  { label: "Số điện thoại" },
  { label: "Email" },
  { label: "Đặt gần nhất", sortKey: "datGanNhat" },
  { label: "Đơn đã đặt", num: true, sortKey: "veDaDat" },
  { label: "Trạng thái" },
  { label: "Thao tác" },
];

const NUM_CELL =
  "num [font-family:var(--font-heading)] font-bold tracking-[-0.01em] text-[var(--ink)]";

const PAGE_GAP =
  "px-0.5 font-bold text-[var(--slate-400)] max-[400px]:hidden";

const PAGINATION_BAR =
  "flex flex-wrap items-center justify-between gap-2.5 border-t border-[var(--border-soft)] px-5 py-3";

type KhachHangTableProps = {
  rows: KhachHang[];
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  page: number;
  pageCount: number;
  onOpenDetail: (khachHang: KhachHang) => void;
};

export function KhachHangTable({
  rows,
  totalCount,
  rangeStart,
  rangeEnd,
  page,
  pageCount,
  onOpenDetail,
}: KhachHangTableProps) {
  const sortKey = useKhachHangFiltersStore((s) => s.sortKey);
  const sortDir = useKhachHangFiltersStore((s) => s.sortDir);
  const toggleSort = useKhachHangFiltersStore((s) => s.toggleSort);
  const setPage = useKhachHangFiltersStore((s) => s.setPage);

  return (
    <section className="table-card" aria-label="Danh sách tài khoản khách hàng">
      <div
        className="table-scroll"
        role="region"
        aria-label="Bảng tài khoản khách hàng"
        tabIndex={0}
      >
        <table className="table kh-table">
          <caption className="sr-only">
            Tài khoản khách hàng — kèm số điện thoại, email, lần đặt gần nhất, số
            đơn đã đặt và trạng thái tài khoản
          </caption>
          <thead>
            <tr>
              {COLUMNS.map((column) => {
                const active = Boolean(
                  column.sortKey && sortKey === column.sortKey
                );
                const headerClass = `${column.num ? "num" : ""}${
                  column.sortKey ? " is-sortable" : ""
                }${active ? " is-sorted" : ""}`;
                if (!column.sortKey) {
                  return (
                    <th key={column.label} scope="col" className={headerClass}>
                      {column.label}
                    </th>
                  );
                }
                return (
                  <th
                    key={column.label}
                    scope="col"
                    className={headerClass}
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
                      onClick={() =>
                        toggleSort(column.sortKey as KhachHangSortKey)
                      }
                      className="inline-flex items-center gap-1"
                    >
                      {column.label}
                      {active ? (
                        <Icon
                          name="i-chevron-down"
                          className={`icon h-3 w-3 ${sortDir === "asc" ? "rotate-180" : ""}`}
                        />
                      ) : (
                        <Icon
                          name="i-swap"
                          className="icon h-3 w-3 opacity-50"
                        />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((kh) => {
              const locked = laTaiKhoanBiKhoa(kh.trangThai);
              const email = tachEmail(kh.email);
              return (
                <tr key={kh.id} onClick={() => onOpenDetail(kh)}>
                  <td data-label="Khách hàng">
                    <div className="flex min-w-[190px] items-center gap-[11px]">
                      <span className="kh-avatar">{vietTatHoTen(kh.ten)}</span>
                      <strong className="min-w-[190px] font-semibold text-[var(--ink)]">
                        {kh.ten}
                      </strong>
                    </div>
                  </td>
                  <td data-label="Số điện thoại">{kh.soDienThoai}</td>
                  <td data-label="Email">
                    {kh.email ? (
                      <span className="flex min-w-[150px] flex-col text-[13px] leading-[1.35]">
                        <span className="[word-break:break-word]">
                          {email.local}
                        </span>
                        {email.domain ? (
                          <span className="text-[var(--slate-500)] [word-break:break-word]">
                            {`@${email.domain}`}
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td data-label="Đặt gần nhất">{kh.datGanNhat}</td>
                  <td data-label="Đơn đã đặt" className={NUM_CELL}>
                    {kh.veDaDat}
                  </td>
                  <td data-label="Trạng thái">
                    <span
                      className={`badge ${TRANG_THAI_TAI_KHOAN_BADGE[kh.trangThai]}`}
                    >
                      {locked && <Icon name="i-lock" />}
                      {TRANG_THAI_TAI_KHOAN_LABEL[kh.trangThai]}
                    </span>
                  </td>
                  <td data-label="Thao tác">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenDetail(kh);
                      }}
                    >
                      <Icon name="i-eye" className="icon h-4 w-4" />
                      Chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={PAGINATION_BAR}>
        <p className="page-note">
          {`Hiển thị ${rangeStart}–${rangeEnd} của ${totalCount} khách hàng`}
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
                  …
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
