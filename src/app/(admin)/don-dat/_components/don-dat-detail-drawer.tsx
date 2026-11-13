"use client";

import { Icon } from "@/components/icons/icon";
import { useModalBehavior } from "@/hooks/use-modal-behavior";
import {
  DON_DAT_STATUS,
  PASSENGER_TRIP_STATUS,
  formatTien,
} from "../_data/don-dat";
import type { DonDatDetail } from "../_utils/map-booking";

const SCRIM_CLASS =
  "absolute inset-0 cursor-default border-0 bg-[rgba(8,20,38,0.5)]";

const CARD_CLASS =
  "relative flex h-full w-[min(620px,100%)] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] max-[560px]:w-full";

const CLOSE_CLASS =
  "grid h-11 w-11 flex-none place-items-center rounded-[var(--radius-sm)] text-[var(--slate-500)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:bg-[var(--navy-50)] hover:text-[var(--ink)]";

const SECTION_CLASS =
  "rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]";

const SECTION_TITLE_CLASS =
  "mb-3 text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--slate-500)]";

const ROW_CLASS =
  "flex items-start justify-between gap-4 py-1.5 text-[13.5px] first:pt-0 last:pb-0";

const ROW_LABEL_CLASS = "text-[var(--slate-500)]";

const ROW_VALUE_CLASS =
  "max-w-[62%] text-right font-semibold text-[var(--ink)]";

type DonDatDetailDrawerProps = {
  detail: DonDatDetail | null;
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onCancel: () => void;
};

export function DonDatDetailDrawer({
  detail,
  open,
  loading,
  error,
  onClose,
  onCancel,
}: DonDatDetailDrawerProps) {
  useModalBehavior(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Đóng chi tiết đơn"
        onClick={onClose}
        className={`${SCRIM_CLASS} animate-[dd-fade-in_0.28s_var(--ease)]`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dd-drawer-title"
        className={`${CARD_CLASS} animate-[dd-drawer-in_0.28s_var(--ease)]`}
      >
        <header className="flex items-start justify-between gap-3.5 border-b border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--sky-50),var(--surface)_78%)] px-5 pb-4 pt-5">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--sky-700)]">
              Chi tiết đơn đặt
              {detail ? (
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10.5px] tracking-[0.06em] text-[var(--sky-800)]">
                  {detail.ma}
                </span>
              ) : null}
            </p>
            <h2
              id="dd-drawer-title"
              className="mt-[7px] [font-family:var(--font-heading)] text-[20px] font-extrabold leading-[1.16] tracking-[-0.02em] text-[var(--ink)]"
            >
              {detail ? detail.khach : "Đang tải..."}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Đóng chi tiết đơn"
            onClick={onClose}
            className={CLOSE_CLASS}
          >
            <Icon name="i-close" className="icon" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && !detail ? (
            <div className="state-loading">Đang tải chi tiết đơn...</div>
          ) : error && !detail ? (
            <div className="state-empty">
              <span className="state-empty-icon text-[var(--red-600)]">
                <Icon name="i-alert" className="icon" />
              </span>
              <h3>Không tải được chi tiết đơn</h3>
              <p>{error}</p>
            </div>
          ) : detail ? (
            <div className="grid gap-3.5">
              <div className="flex flex-wrap gap-1.5">
                <span className={`badge ${DON_DAT_STATUS[detail.trangThai].badge}`}>
                  {DON_DAT_STATUS[detail.trangThai].label}
                </span>
                {detail.passengerTripStatus ? (
                  <span className="badge badge--slate">
                    {PASSENGER_TRIP_STATUS[detail.passengerTripStatus]}
                  </span>
                ) : null}
              </div>

              {detail.lyDoHuy ? (
                <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--red-50)] px-3.5 py-3 text-[13px] text-[var(--red-600)]">
                  <strong className="font-bold">Lý do hủy: </strong>
                  {detail.lyDoHuy}
                  {detail.huyLuc ? ` · ${detail.huyLuc}` : ""}
                </div>
              ) : null}

              <section className={SECTION_CLASS}>
                <h3 className={SECTION_TITLE_CLASS}>Khách hàng</h3>
                <div className="grid">
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Họ tên</span>
                    <span className={ROW_VALUE_CLASS}>{detail.khach}</span>
                  </div>
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Điện thoại</span>
                    <span className={ROW_VALUE_CLASS}>{detail.sdt}</span>
                  </div>
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Email</span>
                    <span className={ROW_VALUE_CLASS}>{detail.email}</span>
                  </div>
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Điểm đón</span>
                    <span className={ROW_VALUE_CLASS}>{detail.pickupAddress}</span>
                  </div>
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Điểm trả</span>
                    <span className={ROW_VALUE_CLASS}>{detail.dropoffAddress}</span>
                  </div>
                </div>
              </section>

              <section className={SECTION_CLASS}>
                <h3 className={SECTION_TITLE_CLASS}>Chuyến</h3>
                <div className="grid">
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Mã chuyến</span>
                    <span className={ROW_VALUE_CLASS}>{detail.chuyen.ma}</span>
                  </div>
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Tuyến</span>
                    <span className={ROW_VALUE_CLASS}>{detail.chuyen.tuyen}</span>
                  </div>
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Khởi hành</span>
                    <span className={ROW_VALUE_CLASS}>
                      {detail.chuyen.khoiHanh}
                    </span>
                  </div>
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Đến dự kiến</span>
                    <span className={ROW_VALUE_CLASS}>
                      {detail.chuyen.denDuKien}
                    </span>
                  </div>
                  <div className={ROW_CLASS}>
                    <span className={ROW_LABEL_CLASS}>Hotline</span>
                    <span className={ROW_VALUE_CLASS}>{detail.chuyen.hotline}</span>
                  </div>
                </div>
              </section>

              <section className={SECTION_CLASS}>
                <h3 className={SECTION_TITLE_CLASS}>Phân công</h3>
                {detail.phanCong ? (
                  <div className="grid">
                    <div className={ROW_CLASS}>
                      <span className={ROW_LABEL_CLASS}>Tài xế</span>
                      <span className={ROW_VALUE_CLASS}>
                        {detail.phanCong.taiXe}
                      </span>
                    </div>
                    <div className={ROW_CLASS}>
                      <span className={ROW_LABEL_CLASS}>SĐT tài xế</span>
                      <span className={ROW_VALUE_CLASS}>
                        {detail.phanCong.sdtTaiXe}
                      </span>
                    </div>
                    <div className={ROW_CLASS}>
                      <span className={ROW_LABEL_CLASS}>Xe</span>
                      <span className={ROW_VALUE_CLASS}>
                        {detail.phanCong.bienSo} · {detail.phanCong.loaiXe}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-[var(--slate-500)]">
                    Chuyến chưa có phân công hợp lệ.
                  </p>
                )}
              </section>

              <section className={SECTION_CLASS}>
                <h3 className={SECTION_TITLE_CLASS}>
                  Vé ({detail.tickets.length})
                </h3>
                <div className="grid gap-2">
                  {detail.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-[var(--radius-sm)] border border-[var(--border-soft)] bg-[var(--bg)] px-3.5 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-[var(--ink)]">
                          {ticket.khach}
                        </span>
                        <span className="text-[13px] font-semibold text-[var(--ink)] [font-variant-numeric:tabular-nums]">
                          {formatTien(ticket.tien)}
                        </span>
                      </div>
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-[var(--slate-500)]">
                        <span>Ghế {ticket.ghe}</span>
                        <span>{ticket.sdt}</span>
                        <span>
                          {PASSENGER_TRIP_STATUS[ticket.passengerTripStatus]}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[12px] text-[var(--slate-500)]">
                        {ticket.diemDon} → {ticket.diemTra}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {detail.history.length > 0 ? (
                <section className={SECTION_CLASS}>
                  <h3 className={SECTION_TITLE_CLASS}>Lịch sử đơn</h3>
                  <ol className="grid gap-3">
                    {detail.history.map((item, index) => (
                      <li
                        key={`${item.eventType}-${index}`}
                        className="grid grid-cols-[11px_1fr] gap-x-3.5"
                      >
                        <span
                          className={`mt-1 h-[11px] w-[11px] rounded-full ${
                            item.done
                              ? "bg-[var(--sky-600)] shadow-[0_0_0_4px_rgba(2,132,199,0.13)]"
                              : "bg-[var(--slate-300)] shadow-[0_0_0_4px_rgba(148,163,184,0.18)]"
                          }`}
                        />
                        <div>
                          <p className="text-[13.5px] font-semibold text-[var(--ink)]">
                            {item.title ?? item.eventType}
                          </p>
                          <p className="text-[12px] text-[var(--slate-500)]">
                            {item.occurredAt}
                            {item.description ? ` · ${item.description}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>

        <footer className="flex flex-wrap justify-end gap-2.5 border-t border-[var(--border-soft)] px-5 py-4">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Đóng
          </button>
          {detail &&
          !["COMPLETED", "CANCELLED", "EXPIRED"].includes(detail.trangThai) ? (
            <button type="button" className="btn btn-danger" onClick={onCancel}>
              <Icon name="i-x-circle" />
              Hủy đơn
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
