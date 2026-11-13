"use client";

import { Icon } from "@/components/icons/icon";
import { formatVND } from "../_data/doanh-thu";
import { useDoanhThuReconciliation } from "../_hooks/use-doanh-thu-reconciliation";

const NUM = "num";
const DIFF_OK = "font-semibold text-[var(--green-700)]";
const DIFF_BAD = "font-semibold text-[var(--red-600)]";

/* Chênh lệch = 0 là khớp; khác 0 cần rà soát. */
function DiffCell({ value }: { value: number }) {
  if (value === 0) {
    return <span className={DIFF_OK}>Khớp</span>;
  }
  const tone = value > 0 ? DIFF_OK : DIFF_BAD;
  return (
    <span className={tone}>
      {value > 0 ? "+" : "−"}
      {formatVND(Math.abs(value))}
    </span>
  );
}

export function ReconTable() {
  const {
    companyId,
    rows,
    totals,
    mismatchedTrips,
    isLoading,
    isError,
    error,
    refetch,
  } = useDoanhThuReconciliation();

  const headNote =
    mismatchedTrips > 0
      ? `${mismatchedTrips} chuyến lệch tiền cần rà soát`
      : "Chênh lệch = tiền mặt thực thu − (số vé đã thu × giá vé)";

  return (
    <article className="table-card">
      <div className="table-card-head">
        <div>
          <h2 className="table-title">Đối soát theo chuyến</h2>
          <p className="table-sub">{headNote}</p>
        </div>
        {mismatchedTrips > 0 ? (
          <span className="badge badge--red">
            <Icon name="i-alert" className="icon" />
            {mismatchedTrips} lệch
          </span>
        ) : null}
      </div>

      {companyId.length === 0 ? (
        <div className="state-empty">
          <span className="state-empty-icon">
            <Icon name="i-alert" className="icon" />
          </span>
          <h3>Chưa chọn hãng quản lý</h3>
          <p>Chọn hãng đang quản lý để xem đối soát thực thu.</p>
        </div>
      ) : isLoading ? (
        <div className="state-loading">Đang tải dữ liệu đối soát...</div>
      ) : isError ? (
        <div className="state-empty">
          <span className="state-empty-icon text-[var(--red-600)]">
            <Icon name="i-alert" className="icon" />
          </span>
          <h3>Không tải được dữ liệu đối soát</h3>
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
            <Icon name="i-list" className="icon" />
          </span>
          <h3>Chưa có dữ liệu đối soát</h3>
          <p>Không có chuyến nào phát sinh trong kỳ đã chọn.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Chuyến</th>
                <th>Tuyến</th>
                <th>Khởi hành</th>
                <th className={NUM}>Đã đặt</th>
                <th className={NUM}>Đã thu</th>
                <th className={NUM}>Dự kiến</th>
                <th className={NUM}>Thực thu</th>
                <th className={NUM}>Chênh lệch</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.tripId}>
                  <td className="font-semibold text-[var(--ink)]">
                    {row.tripCode}
                  </td>
                  <td>{row.routeName}</td>
                  <td className="whitespace-nowrap">{row.departureLabel}</td>
                  <td className={NUM}>{row.bookedTickets}</td>
                  <td className={NUM}>{row.collectedTickets}</td>
                  <td className={NUM}>{formatVND(row.expectedRevenue)}</td>
                  <td className={NUM}>{formatVND(row.collectedRevenue)}</td>
                  <td className={NUM}>
                    <DiffCell value={row.difference} />
                  </td>
                </tr>
              ))}
            </tbody>
            {totals ? (
              <tfoot>
                <tr>
                  <td
                    className="font-bold text-[var(--ink)]"
                    colSpan={3}
                  >
                    Tổng cộng
                  </td>
                  <td className={`${NUM} font-bold text-[var(--ink)]`}>
                    {totals.bookedTickets}
                  </td>
                  <td className={`${NUM} font-bold text-[var(--ink)]`}>
                    {totals.collectedTickets}
                  </td>
                  <td className={NUM}>—</td>
                  <td className={`${NUM} font-bold text-[var(--ink)]`}>
                    {formatVND(totals.collectedRevenue)}
                  </td>
                  <td className={NUM}>
                    <DiffCell
                      value={
                        totals.collectedRevenue -
                        rows.reduce((sum, row) => sum + row.expectedRevenue, 0)
                      }
                    />
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      )}
    </article>
  );
}
