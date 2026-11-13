"use client";

import { Icon } from "@/components/icons/icon";
import { useDonDatFiltersStore } from "@/global-states/don-dat-filters-store";
import { pageIndexes } from "@/utils/table";
import {
  DON_DAT_STATUS,
  PASSENGER_TRIP_STATUS,
  formatTien,
} from "../_data/don-dat";
import { mocThoiGian, type DonDatRow } from "../_utils/map-booking";

/* Trạng thái không còn cho phép hủy đơn. */
const KHONG_THE_HUY: DonDatRow["trangThai"][] = [
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
];

const CELL_ACTION_BASE = [
  "inline-flex min-h-[44px] items-center gap-1.5",
  "rounded-[var(--radius-sm)] px-2.5 text-[13px] font-bold",
  "transition-colors disabled:cursor-not-allowed",
  "disabled:text-[var(--slate-400)] disabled:hover:bg-transparent",
].join(" ");

const CELL_ACTION_VIEW = [
  CELL_ACTION_BASE,
  "text-[var(--sky-700)] hover:bg-[var(--sky-100)] hover:text-[var(--sky-800)]",
].join(" ");

const CELL_ACTION_CANCEL = [
  CELL_ACTION_BASE,
  "text-[var(--red-600)] hover:bg-[var(--red-50)]",
].join(" ");

const PAGE_GAP = "px-0.5 font-bold text-[var(--slate-400)] max-[400px]:hidden";

const TABLE_FOOTER_CLASS = [
  "flex flex-wrap items-center justify-between gap-2.5",
  "border-t border-[var(--border-soft)] px-5 py-3",
].join(" ");

const ACTIONS_CLASS =
  "flex flex-wrap items-center justify-end gap-1.5 max-[768px]:w-full";

const HOLD_CLASS = "mt-0.5 block text-[11.5px] font-semibold text-[var(--orange-700)]";

type DonDatTableProps = {
  rows: DonDatRow[];
  totalCount: number;
  rangeStart: number;
  rangeEnd: number;
  pageCount: number;
  page: number;
  onDetail: (row: DonDatRow) => void;
  onCancel: (row: DonDatRow) => void;
};

export function DonDatTable({
  rows,
  totalCount,
  rangeStart,
  rangeEnd,
  pageCount,
  page,
  onDetail,
  onCancel,
}: DonDatTableProps) {
  const setPage = useDonDatFiltersStore((s) => s.setPage);

  return (
    <section className="table-card" aria-labelledby="dd-table-title">
      <div className="table-card-head">
        <div>
          <h2 className="table-title" id="dd-table-title">
            Danh sách đơn đặt
          </h2>
          <p className="table-sub">
            Đơn đặt vé toàn hãng, lọc theo trạng thái và ngày khởi hành.
          </p>
        </div>
      </div>

      <div
        className="table-scroll"
        role="region"
        aria-label="Bảng danh sách đơn đặt"
        tabIndex={0}
      >
        <table className="table dd-table">
          <caption className="sr-only">
            Danh sách đơn đặt vé: mã đơn, khách hàng, chuyến, khởi hành, số vé,
            tổng tiền và trạng thái
          </caption>
          <thead>
            <tr>
              <th scope="col">Mã đơn</th>
              <th scope="col">Khách hàng</th>
              <th scope="col">Chuyến</th>
              <th scope="col">Khởi hành</th>
              <th scope="col">Vé / Ghế</th>
              <th scope="col" className="th-money">
                Tổng tiền
              </th>
              <th scope="col">Trạng thái</th>
              <th scope="col" className="th-act">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const status = DON_DAT_STATUS[row.trangThai];
              const canCancel = !KHONG_THE_HUY.includes(row.trangThai);
              return (
                <tr key={row.id}>
                  <td data-label="Mã đơn">
                    <span className="block font-bold text-[var(--ink)]">
                      {row.ma}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-[var(--slate-500)]">
                      {row.tuyen}
                    </span>
                  </td>
                  <td data-label="Khách hàng">
                    <span className="block font-semibold text-[var(--ink)]">
                      {row.khach}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-[var(--slate-500)]">
                      {row.sdt}
                    </span>
                  </td>
                  <td data-label="Chuyến">
                    <span className="block font-semibold text-[var(--ink)]">
                      {row.chuyen}
                    </span>
                    {row.passengerTripStatus ? (
                      <span className="mt-0.5 block text-[12px] text-[var(--slate-500)]">
                        {PASSENGER_TRIP_STATUS[row.passengerTripStatus]}
                      </span>
                    ) : null}
                  </td>
                  <td data-label="Khởi hành" className="whitespace-nowrap">
                    {row.khoiHanh}
                    {row.trangThai === "HOLDING" && row.holdExpiresAt ? (
                      <span className={HOLD_CLASS}>
                        Giữ đến {mocThoiGian(row.holdExpiresAt)}
                      </span>
                    ) : null}
                  </td>
                  <td data-label="Vé / Ghế">
                    <span className="block font-semibold text-[var(--ink)]">
                      {row.soVe} vé
                    </span>
                    <span className="mt-0.5 block text-[12px] text-[var(--slate-500)]">
                      {row.ghe || "—"}
                    </span>
                  </td>
                  <td data-label="Tổng tiền" className="num t-money">
                    {formatTien(row.tien, row.currency)}
                  </td>
                  <td data-label="Trạng thái">
                    <span className={`badge ${status.badge}`}>
                      {status.label}
                    </span>
                  </td>
                  <td data-label="Thao tác" className="t-act">
                    <div className={ACTIONS_CLASS}>
                      <button
                        type="button"
                        className={CELL_ACTION_VIEW}
                        onClick={() => onDetail(row)}
                      >
                        <Icon name="i-eye" className="icon h-4 w-4" />
                        Xem
                      </button>
                      <button
                        type="button"
                        className={CELL_ACTION_CANCEL}
                        disabled={!canCancel}
                        title={
                          canCancel
                            ? undefined
                            : "Đơn đã hoàn thành/hủy/hết hạn — không thể hủy"
                        }
                        onClick={() => onCancel(row)}
                      >
                        <Icon name="i-x-circle" className="icon h-4 w-4" />
                        Hủy
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
            {totalCount > 0
              ? `Hiển thị ${rangeStart}–${rangeEnd} của ${totalCount} đơn`
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
          </div>
        </div>
      )}
    </section>
  );
}
