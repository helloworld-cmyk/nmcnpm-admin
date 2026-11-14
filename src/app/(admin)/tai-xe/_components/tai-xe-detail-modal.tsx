"use client";

import { Icon } from "@/components/icons/icon";
import { Modal } from "@/components/ui/modal";
import type { CompanyDriverTripResponse } from "@/api/tai-xe/api/types";
import {
  TRANG_THAI_TAI_XE_LABEL,
  daHetHan,
  formatNgay,
  laSapHetHan,
  soNgayConLai,
  type TaiXe,
} from "../_utils/tai-xe";

type TaiXeDetailModalProps = {
  taiXe: TaiXe | null;
  loading: boolean;
  trips: CompanyDriverTripResponse[];
  tripsLoading: boolean;
  tripsError: boolean;
  onClose: () => void;
  onEditRequest: () => void;
  onResetRequest: () => void;
  onToggleStatus: () => void;
};

const TRIP_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Nháp",
  SCHEDULED: "Sắp chạy",
  IN_PROGRESS: "Đang chạy",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  TERMINATED: "Dừng sớm",
};

const TRIP_STATUS_BADGE: Record<string, string> = {
  DRAFT: "badge--slate",
  SCHEDULED: "badge--sky",
  IN_PROGRESS: "badge--orange",
  COMPLETED: "badge--green",
  CANCELLED: "badge--red",
  TERMINATED: "badge--red",
};

const DETAIL_GRID =
  "grid gap-x-4 gap-y-3.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-4 py-4 [grid-template-columns:repeat(2,1fr)] max-[520px]:[grid-template-columns:1fr]";

const DETAIL_DT =
  "text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--slate-500)]";

const DETAIL_DD =
  "mt-0.5 text-[14px] font-semibold text-[var(--ink)] [word-break:break-word]";

const TRIP_LIST = "grid gap-2";

const TRIP_ITEM =
  "flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
}

export function TaiXeDetailModal({
  taiXe,
  loading,
  trips,
  tripsLoading,
  tripsError,
  onClose,
  onEditRequest,
  onResetRequest,
  onToggleStatus,
}: TaiXeDetailModalProps) {
  const locked = taiXe?.trangThai === "locked";
  const left = taiXe ? soNgayConLai(taiXe.hanGplx) : Number.NaN;
  const hetHan = taiXe ? daHetHan(taiXe.hanGplx) : false;
  const warn = taiXe ? !hetHan && laSapHetHan(taiXe.hanGplx) : false;

  return (
    <Modal
      open={taiXe !== null}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex flex-col gap-1.5">
          <span className="[font-family:var(--font-heading)] text-[18.5px] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--ink)]">
            {taiXe?.ten ?? "Tài xế"}
          </span>
          <span className={`badge ${locked ? "badge--red" : "badge--green"}`}>
            <span className="tx-dot" aria-hidden="true" />
            {taiXe ? TRANG_THAI_TAI_XE_LABEL[taiXe.trangThai] : ""}
          </span>
        </div>
      }
    >
      {taiXe && (
        <>
          {loading ? (
            <p className="text-[12.5px] font-medium text-[var(--slate-400)]">
              Đang cập nhật thông tin mới nhất…
            </p>
          ) : null}
          <dl className={DETAIL_GRID}>
            <div>
              <dt className={DETAIL_DT}>Số điện thoại</dt>
              <dd className={DETAIL_DD}>{taiXe.soDienThoai || "—"}</dd>
            </div>
            <div>
              <dt className={DETAIL_DT}>Email</dt>
              <dd className={DETAIL_DD}>{taiXe.email || "—"}</dd>
            </div>
            <div>
              <dt className={DETAIL_DT}>Giấy phép lái xe</dt>
              <dd className={DETAIL_DD}>
                {taiXe.hangGplx
                  ? `${taiXe.hangGplx} · ${taiXe.gplx}`
                  : taiXe.gplx}
              </dd>
            </div>
            <div>
              <dt className={DETAIL_DT}>Hạn GPLX</dt>
              <dd className={`${DETAIL_DD} flex flex-wrap items-center gap-2`}>
                <span>{formatNgay(taiXe.hanGplx)}</span>
                {hetHan ? (
                  <span className="badge badge--red">Đã hết hạn</span>
                ) : warn ? (
                  <span className="badge badge--orange">
                    Còn {Math.max(left, 0)} ngày
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className={DETAIL_DT}>Chuyến (30 ngày)</dt>
              <dd className={DETAIL_DD}>{taiXe.trips30Days}</dd>
            </div>
            <div>
              <dt className={DETAIL_DT}>Ngày tạo tài khoản</dt>
              <dd className={DETAIL_DD}>{taiXe.ngayTao}</dd>
            </div>
          </dl>

          {taiXe.statusNote ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
              <span className={DETAIL_DT}>Ghi chú trạng thái</span>
              <p className="mt-1 text-[13.5px] font-medium text-[var(--ink)] [word-break:break-word]">
                {taiXe.statusNote}
              </p>
            </div>
          ) : null}

          <div>
            <h3 className="mb-2.5 text-[15px] font-bold text-[var(--ink)]">
              Chuyến được phân công gần đây
            </h3>
            {tripsLoading ? (
              <p className="text-[13px] font-medium text-[var(--slate-500)]">
                Đang tải chuyến được phân công...
              </p>
            ) : tripsError ? (
              <p className="text-[13px] font-medium text-[var(--red-600)]">
                Không tải được danh sách chuyến được phân công.
              </p>
            ) : trips.length === 0 ? (
              <p className="text-[13px] font-medium text-[var(--slate-500)]">
                Tài xế chưa được phân công chuyến nào gần đây.
              </p>
            ) : (
              <ul className={TRIP_LIST}>
                {trips.map((trip) => (
                  <li key={trip.tripId} className={TRIP_ITEM}>
                    <div className="min-w-0">
                      <strong className="block truncate text-[13.5px] font-bold text-[var(--ink)]">
                        {trip.tripCode}
                      </strong>
                      <span className="block truncate text-[12.5px] font-medium text-[var(--slate-500)]">
                        {trip.routeName}
                      </span>
                    </div>
                    <div className="flex flex-none items-center gap-2.5">
                      <span className="text-[12.5px] font-semibold text-[var(--slate-500)]">
                        {formatDateTime(trip.departureAt)}
                      </span>
                      <span
                        className={`badge ${TRIP_STATUS_BADGE[trip.status] ?? "badge--slate"}`}
                      >
                        {TRIP_STATUS_LABEL[trip.status] ?? trip.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-1 flex flex-wrap justify-end gap-2.5 border-t border-[var(--border-soft)] pt-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onResetRequest}
            >
              <Icon name="i-refresh" />
              Đặt lại mật khẩu
            </button>
            <button
              type="button"
              className="btn btn-accent"
              onClick={onToggleStatus}
            >
              <Icon name={locked ? "i-user-check" : "i-lock"} />
              {locked ? "Mở khóa" : "Khóa tài khoản"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onEditRequest}
            >
              <Icon name="i-edit" />
              Sửa thông tin
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
