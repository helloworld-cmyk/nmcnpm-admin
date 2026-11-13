"use client";

import { Icon } from "@/components/icons/icon";
import {
  useChuyenFiltersStore,
  type ChuyenSortKey,
} from "@/global-states/chuyen-filters-store";
import { pageIndexes } from "@/utils/table";
import {
  LENH_CHUA_PHAN_CONG,
  LENH_HIENTHI,
  SO_DONG_MOI_TRANG,
  TRANG_THAI_HIENTHI,
  chuaKhoiHanh,
  coTheCongBo,
  coTheHuy,
  coThePhanCong,
  coTheSua,
  coTheXoa,
  dinhDangTien,
  isoSangNhanNgan,
  isoSangNhanSub,
  tyLeLapGhe,
  vietTat,
  type ChuyenRecord,
} from "../_data/chuyen";

const COLUMNS: { label: string; sortKey?: ChuyenSortKey; num?: boolean }[] = [
  { label: "Mã chuyến", sortKey: "ma" },
  { label: "Tuyến" },
  { label: "Khởi hành", sortKey: "khoiHanh" },
  { label: "Tài xế" },
  { label: "Xe" },
  { label: "Lấp ghế", sortKey: "daDat" },
  { label: "Giá vé", sortKey: "giaVe", num: true },
  { label: "Trạng thái" },
  { label: "Thao tác", num: true },
];

const TD_STRONG_CLASS =
  "block [font-family:var(--font-heading)] text-[13.5px] font-bold leading-[1.35] text-[var(--ink)]";

const TD_SUB_CLASS = "mt-px block text-[11.5px] text-[var(--slate-400)]";

const MA_CHUYEN_CLASS =
  "block [font-family:var(--font-heading)] text-[13.5px] font-bold text-[var(--ink)]";

const CHIP_PENDING_CLASS =
  "inline-flex items-center gap-1.5 rounded-full border border-[var(--orange-100)] bg-[var(--orange-50)] px-2.5 py-[5px] text-[11.5px] font-bold text-[var(--orange-700)]";

const DRIVER_CELL_CLASS = "flex items-center gap-2";

const DRIVER_NAME_CLASS = "text-[13.5px] font-semibold text-[var(--slate-700)]";

const SEAT_NUM_CLASS =
  "text-[12px] font-medium text-[var(--slate-500)] [font-variant-numeric:tabular-nums]";

const BADGE_STACK_CLASS = "flex flex-wrap gap-1.5";

const META_STRONG_CLASS = "font-bold text-[var(--ink)]";

const PAGE_GAP = "px-0.5 font-bold text-[var(--slate-400)] max-[400px]:hidden";

function seatBarVariant(trip: ChuyenRecord) {
  if (trip.trangThai === "da-huy") return "seat-bar-fill--muted";
  const tyLe = tyLeLapGhe(trip);
  if (tyLe >= 100) return "seat-bar-fill--full";
  if (tyLe >= 70) return "seat-bar-fill--warn";
  return "";
}

type ChuyenTableProps = {
  rows: ChuyenRecord[];
  total: number;
  page: number;
  pageCount: number;
  onDetail: (tripId: string) => void;
  onEdit: (trip: ChuyenRecord) => void;
  onCancel: (tripId: string) => void;
  onDelete: (tripId: string) => void;
  onReset: () => void;
  onPublish: (tripId: string) => void;
};

export function ChuyenTable({
  rows,
  total,
  page,
  pageCount,
  onDetail,
  onEdit,
  onCancel,
  onDelete,
  onReset,
  onPublish,
}: ChuyenTableProps) {
  const sortKey = useChuyenFiltersStore((s) => s.sortKey);
  const sortDir = useChuyenFiltersStore((s) => s.sortDir);
  const toggleSort = useChuyenFiltersStore((s) => s.toggleSort);
  const setPage = useChuyenFiltersStore((s) => s.setPage);

  const start = rows.length > 0 ? (page - 1) * SO_DONG_MOI_TRANG + 1 : 0;
  const end = (page - 1) * SO_DONG_MOI_TRANG + rows.length;

  return (
    <section className="table-card" aria-label="Danh sách chuyến">
      <div
        className="table-scroll"
        role="region"
        aria-label="Bảng danh sách chuyến (cuộn ngang để xem đủ cột)"
        tabIndex={0}
      >
        <table className="table chuyen-table">
          <caption className="sr-only">
            Danh sách chuyến: tuyến, giờ khởi hành, tài xế, xe, lấp ghế, giá vé
            và trạng thái vận hành
          </caption>
          <thead>
            <tr>
              {COLUMNS.map((column) => {
                const thClass = [
                  column.sortKey ? "is-sortable" : "",
                  column.num ? "num th-act" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                if (!column.sortKey) {
                  return (
                    <th key={column.label} scope="col" className={thClass}>
                      {column.label}
                    </th>
                  );
                }
                const active = sortKey === column.sortKey;
                return (
                  <th
                    key={column.label}
                    scope="col"
                    className={`${thClass}${active ? " is-sorted" : ""}`}
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
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort(column.sortKey as ChuyenSortKey)}
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
            {rows.map((trip) => {
              const hienThi = TRANG_THAI_HIENTHI[trip.trangThai];
              const lenhInfo = trip.taixe
                ? trip.lenh
                  ? LENH_HIENTHI[trip.lenh]
                  : null
                : LENH_CHUA_PHAN_CONG;
              const daHuy = trip.trangThai === "da-huy";
              return (
                <tr key={trip.id}>
                  <td data-label="Mã chuyến">
                    <strong className={MA_CHUYEN_CLASS}>{trip.ma}</strong>
                  </td>
                  <td data-label="Tuyến">
                    <strong className={`${TD_STRONG_CLASS} whitespace-nowrap`}>
                      {trip.tuyen}
                    </strong>
                  </td>
                  <td data-label="Khởi hành">
                    <strong className={TD_STRONG_CLASS}>
                      {trip.gio} · {isoSangNhanNgan(trip.ngayISO)}
                    </strong>
                    <span className={TD_SUB_CLASS}>
                      {daHuy
                        ? "Đã hủy trước khởi hành"
                        : isoSangNhanSub(trip.ngayISO)}
                    </span>
                  </td>
                  <td data-label="Tài xế">
                    <div className="flex flex-col items-start gap-1.5">
                      {trip.taixe ? (
                        <div className={DRIVER_CELL_CLASS}>
                          <span className="cv-avatar cv-avatar--td" aria-hidden="true">
                            {vietTat(trip.taixe)}
                          </span>
                          <span className={DRIVER_NAME_CLASS}>{trip.taixe}</span>
                        </div>
                      ) : (
                        <span className={CHIP_PENDING_CLASS}>
                          <Icon name="i-alert" className="icon h-3.5 w-3.5" />
                          Chưa phân công
                        </span>
                      )}
                      {lenhInfo && (
                        <span className={`badge badge--sm ${lenhInfo.badgeClass}`}>
                          <Icon name={lenhInfo.icon} />
                          {lenhInfo.label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td data-label="Xe">
                    {trip.xeBienSo ? (
                      <>
                        <strong className={TD_STRONG_CLASS}>{trip.xeBienSo}</strong>
                        <span className={TD_SUB_CLASS}>{trip.xeLoai}</span>
                      </>
                    ) : (
                      <span className={CHIP_PENDING_CLASS}>
                        <Icon name="i-alert" className="icon h-3.5 w-3.5" />
                        Chưa gán xe
                      </span>
                    )}
                  </td>
                  <td data-label="Lấp ghế">
                    <div className="grid gap-1.5">
                      <span
                        className="seat-bar"
                        role="img"
                        aria-label={`Đã đặt ${trip.daDat} trên ${trip.sucChua} ghế`}
                      >
                        <span
                          className={`seat-bar-fill ${seatBarVariant(trip)}`}
                          style={{ width: `${tyLeLapGhe(trip)}%` }}
                        />
                      </span>
                      <span className={SEAT_NUM_CLASS}>
                        <strong>{trip.daDat}</strong>/{trip.sucChua} ghế
                      </span>
                    </div>
                  </td>
                  <td className="num" data-label="Giá vé">
                    <strong className={TD_STRONG_CLASS}>
                      {dinhDangTien(trip.giaVe)}
                    </strong>
                    <span className={TD_SUB_CLASS}>mỗi ghế</span>
                  </td>
                  <td data-label="Trạng thái">
                    <div className={BADGE_STACK_CLASS}>
                      <span className={`badge ${hienThi.badgeClass}`}>
                        {hienThi.label}
                      </span>
                      {trip.tre ? (
                        <span className="badge badge--red">
                          <Icon name="i-alert" />
                          Trễ {trip.tre}&#39;
                        </span>
                      ) : null}
                      {trip.suco && trip.suco.trangThai !== "da-xu-ly" && (
                        <span
                          className={`badge badge--sm ${
                            trip.suco.trangThai === "mo"
                              ? "badge--orange"
                              : "badge--sky"
                          }`}
                        >
                          <Icon name="i-alert" />
                          {trip.suco.trangThai === "mo" ? "Sự cố" : "Đang xử lý"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="t-act" data-label="Thao tác">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        aria-label={`Xem chi tiết chuyến ${trip.ma}`}
                        onClick={() => onDetail(trip.id)}
                      >
                        Chi tiết
                      </button>
                      {coTheCongBo(trip) && chuaKhoiHanh(trip) && (
                        <button
                          type="button"
                          className="btn btn-sm btn-sky"
                          title="Công bố chuyến — bật mở bán vé"
                          aria-label={`Công bố chuyến ${trip.ma}`}
                          onClick={() => onPublish(trip.id)}
                        >
                          <Icon name="i-publish" />
                          Công bố
                        </button>
                      )}
                      {trip.trangThai === "sap-toi" && (
                        <>
                          {(coTheSua(trip) || coThePhanCong(trip)) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost row-icon-btn"
                              title={
                                coTheSua(trip)
                                  ? trip.taixe
                                    ? "Sửa chuyến"
                                    : "Phân công tài xế và xe"
                                  : "Đổi xe và tài xế"
                              }
                              aria-label={
                                coTheSua(trip)
                                  ? trip.taixe
                                    ? `Sửa chuyến ${trip.ma}`
                                    : `Phân công tài xế và xe cho ${trip.ma}`
                                  : `Đổi xe và tài xế cho ${trip.ma}`
                              }
                              onClick={() => onEdit(trip)}
                            >
                              <Icon
                                name={
                                  coTheSua(trip) && trip.taixe
                                    ? "i-edit"
                                    : "i-users"
                                }
                              />
                            </button>
                          )}
                          {coTheXoa(trip) ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost row-icon-btn"
                              title="Xóa chuyến nháp"
                              aria-label={`Xóa chuyến nháp ${trip.ma}`}
                              onClick={() => onDelete(trip.id)}
                            >
                              <Icon name="i-trash" />
                            </button>
                          ) : coTheHuy(trip) ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost row-icon-btn"
                              title="Hủy chuyến"
                              aria-label={`Hủy chuyến ${trip.ma}`}
                              onClick={() => onCancel(trip.id)}
                            >
                              <Icon name="i-x-circle" />
                            </button>
                          ) : null}
                        </>
                      )}
                      {trip.trangThai === "dang-thuc-hien" && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost row-icon-btn"
                            disabled
                            title="Chuyến đang thực hiện — không sửa trực tiếp"
                            aria-label={`Sửa chuyến ${trip.ma} (không khả dụng)`}
                          >
                            <Icon name="i-edit" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost row-icon-btn"
                            disabled
                            title="Chuyến đang thực hiện — xử lý qua báo sự cố"
                            aria-label={`Hủy chuyến ${trip.ma} (không khả dụng)`}
                          >
                            <Icon name="i-trash" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="state-empty">
          <span className="state-empty-icon" aria-hidden="true">
            <Icon name="i-ticket" className="icon" />
          </span>
          <h3>Không có chuyến nào khớp bộ lọc</h3>
          <p>
            Thử xóa bộ lọc hoặc tìm từ khóa khác. Chuyến mới tạo sẽ hiện ngay
            sau khi lưu.
          </p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            Xóa bộ lọc
          </button>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3.5 border-t border-[var(--border-soft)] px-4 py-3.5 max-[768px]:justify-center">
        <p className="page-note" role="status">
          {total > 0 ? (
            <>
              Đang hiển thị{" "}
              <strong className={META_STRONG_CLASS}>
                {start}–{end}
              </strong>{" "}
              trong <strong className={META_STRONG_CLASS}>{total}</strong> chuyến
            </>
          ) : (
            "Không có chuyến nào khớp bộ lọc hiện tại"
          )}
        </p>
        <nav className="pagination" aria-label="Phân trang danh sách chuyến">
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
        </nav>
      </footer>
    </section>
  );
}
