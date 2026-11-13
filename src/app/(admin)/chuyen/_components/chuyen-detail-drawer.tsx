"use client";

import { Icon } from "@/components/icons/icon";
import { useModalBehavior } from "@/hooks/use-modal-behavior";
import {
  bienPhapLabel,
  dinhDangTien,
  vietTat,
  type ChuyenRecord,
} from "../_data/chuyen";
import { useChuyenDetailDrawer } from "../_hooks/use-chuyen-detail-drawer";
import {
  LENH_STEPS,
  type StepState,
  type TimelineState,
} from "../_utils/chuyen-detail";

type ChuyenDetailDrawerProps = {
  trip: ChuyenRecord | null;
  onClose: () => void;
  onEdit: (trip: ChuyenRecord) => void;
  onCancel: (trip: ChuyenRecord) => void;
  onDelete: (trip: ChuyenRecord) => void;
  onSuco: (trip: ChuyenRecord, step: "nhan" | "ket-qua") => void;
};

const DOT_STATE_CLASS: Record<TimelineState, string> = {
  done: "bg-[var(--sky-600)] shadow-[0_0_0_4px_rgba(2,132,199,0.13)]",
  current: "bg-[var(--orange-500)] shadow-[0_0_0_4px_rgba(249,115,22,0.16)]",
  pending: "bg-[var(--slate-300)] shadow-[0_0_0_4px_rgba(148,163,184,0.18)]",
  complete: "bg-[var(--green-600)] shadow-[0_0_0_4px_rgba(5,150,105,0.14)]",
  cancelled: "bg-[var(--red-600)] shadow-[0_0_0_4px_rgba(220,38,38,0.14)]",
};

const TIMELINE_ITEM_CLASS =
  "relative grid grid-cols-[11px_1fr] gap-x-3.5 pb-3.5 last:pb-0";

const TIMELINE_LINE_CLASS =
  "before:absolute before:bottom-0 before:left-[5px] before:top-[9px] before:w-[2px] before:-translate-x-1/2 before:bg-[repeating-linear-gradient(to_bottom,var(--slate-200)_0_4px,transparent_4px_8px)] before:content-[''] last:before:hidden";

const STEP_STATE_CLASS: Record<StepState, string> = {
  done: "border-[var(--green-100)] bg-[var(--green-50)] text-[var(--green-700)]",
  current: "border-[var(--sky-100)] bg-[var(--sky-50)] text-[var(--sky-800)]",
  idle: "border-[var(--border)] bg-[var(--bg)] text-[var(--slate-500)]",
};

const STEP_DOT_CLASS: Record<StepState, string> = {
  done: "bg-[var(--green-600)]",
  current: "bg-[var(--sky-600)]",
  idle: "bg-[var(--slate-300)]",
};

const SCRIM_BASE_CLASS =
  "absolute inset-0 cursor-default border-0 bg-[rgba(8,20,38,0.5)]";

const CARD_BASE_CLASS =
  "relative flex h-full w-[min(600px,100%)] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] max-[560px]:w-full";

const PANEL_CLOSE_CLASS =
  "grid h-11 w-11 flex-none place-items-center rounded-[var(--radius-sm)] text-[var(--slate-500)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:bg-[var(--navy-50)] hover:text-[var(--ink)]";

const D_LABEL_CLASS =
  "text-[15px] font-bold tracking-[-0.01em] text-[var(--ink)]";

export function ChuyenDetailDrawer({
  trip,
  onClose,
  onEdit,
  onCancel,
  onDelete,
  onSuco,
}: ChuyenDetailDrawerProps) {
  const {
    detail,
    isLoading: ticketsLoading,
    isError: ticketsError,
    errorText: ticketsErrorText,
    refetch: refetchTickets,
    closeBtnRef,
  } = useChuyenDetailDrawer(trip);

  useModalBehavior(Boolean(trip), onClose);

  if (!trip || !detail) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Đóng chi tiết chuyến"
        onClick={onClose}
        className={`${SCRIM_BASE_CLASS} animate-[cd-fade-in_0.28s_var(--ease)]`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cd-drawer-title"
        className={`${CARD_BASE_CLASS} animate-[cd-drawer-in_0.28s_var(--ease)]`}
      >
        <header className="grid gap-3.5 border-b border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--sky-50),var(--surface)_78%)] px-5 pb-4 pt-5 max-[560px]:px-4">
          <div className="flex items-start justify-between gap-3.5">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--sky-700)]">
                Chi tiết chuyến
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10.5px] tracking-[0.06em] text-[var(--sky-800)]">
                  {trip.ma}
                </span>
              </p>
              <h2
                id="cd-drawer-title"
                className="mt-[7px] [font-family:var(--font-heading)] text-[20px] font-extrabold leading-[1.16] tracking-[-0.02em] text-[var(--ink)]"
              >
                {trip.tuyen}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-[var(--slate-500)]">
                <Icon name="i-clock" className="h-3.5 w-3.5 flex-none text-[var(--slate-400)]" />
                {detail.timeText}
              </p>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              aria-label="Đóng chi tiết chuyến"
              onClick={onClose}
              className={PANEL_CLOSE_CLASS}
            >
              <Icon name="i-close" className="icon" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              <span className={`badge ${detail.hienThi.badgeClass}`}>
                {detail.hienThi.label}
              </span>
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
          </div>
        </header>

        <div className="scroll-area flex flex-1 flex-col gap-[18px] overflow-y-auto px-5 py-[18px] max-[560px]:px-4">
          <section
            className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2.5 max-[560px]:grid-cols-1"
            aria-label="Tóm tắt chuyến"
          >
            <div className="grid min-w-0 content-start gap-1 rounded-xl border border-[var(--border-soft)] bg-[var(--bg)] p-3">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--slate-500)]">
                Lấp ghế
              </span>
              <strong className="flex flex-wrap items-baseline [font-family:var(--font-heading)] text-[20px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] [font-variant-numeric:tabular-nums]">
                {detail.daDat}
                <span className="ml-px [font-family:var(--font-body)] text-[11.5px] font-semibold tracking-normal text-[var(--slate-500)]">
                  /{detail.sucChua} ghế
                </span>
              </strong>
              <span
                className="seat-bar seat-bar--wide mt-[5px]"
                role="img"
                aria-label={`Đã đặt ${detail.daDat} trên ${detail.sucChua} ghế`}
              >
                <span
                  className={`seat-bar-fill ${detail.seatVariant}`}
                  style={{ width: `${detail.tyLe}%` }}
                />
              </span>
            </div>
            <div className="grid min-w-0 content-start gap-1 rounded-xl border border-[var(--border-soft)] bg-[var(--bg)] p-3">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--slate-500)]">
                Giá vé
              </span>
              <strong className="[font-family:var(--font-heading)] text-[20px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)] [font-variant-numeric:tabular-nums]">
                {detail.giaVeText}
              </strong>
              <span className="text-[11.5px] text-[var(--slate-500)]">
                mỗi ghế
              </span>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-2.5 max-[560px]:grid-cols-1">
            <div
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                detail.driverName
                  ? "border-[var(--border-soft)] bg-[var(--surface)]"
                  : "border-[var(--orange-100)] bg-[var(--orange-50)]"
              }`}
            >
              <span
                className={`cv-avatar cv-avatar--lg${detail.driverName ? "" : " !bg-[var(--orange-100)] !text-[var(--orange-700)]"}`}
                aria-hidden="true"
              >
                {detail.driverInitial}
              </span>
              <div className="grid min-w-0 gap-px">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--slate-500)]">
                  Tài xế
                </span>
                <strong
                  className={`text-[13.5px] font-semibold [overflow-wrap:anywhere] ${detail.driverName ? "text-[var(--ink)]" : "text-[var(--orange-700)]"}`}
                >
                  {detail.driverName ?? "Chưa phân công"}
                </strong>
                <span className="text-[11.5px] text-[var(--slate-500)]">
                  {detail.driverPhone ??
                    (detail.driverName
                      ? "Tài xế phụ trách"
                      : "Cần phân công tài xế")}
                </span>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                detail.vehiclePlate
                  ? "border-[var(--border-soft)] bg-[var(--surface)]"
                  : "border-[var(--orange-100)] bg-[var(--orange-50)]"
              }`}
            >
              <span
                className={`grid h-[38px] w-[38px] flex-none place-items-center rounded-[10px] ${
                  detail.vehiclePlate
                    ? "bg-[var(--navy-50)] text-[var(--sky-700)]"
                    : "bg-[var(--orange-100)] text-[var(--orange-700)]"
                }`}
                aria-hidden="true"
              >
                <Icon name="i-car" className="h-[19px] w-[19px]" />
              </span>
              <div className="grid min-w-0 gap-px">
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--slate-500)]">
                  Xe
                </span>
                <strong
                  className={`text-[13.5px] font-semibold [overflow-wrap:anywhere] ${detail.vehiclePlate ? "text-[var(--ink)]" : "text-[var(--orange-700)]"}`}
                >
                  {detail.vehiclePlate ?? "Chưa gán xe"}
                </strong>
                <span className="text-[11.5px] text-[var(--slate-500)]">
                  {detail.vehicleSub ?? "Cần phân công xe"}
                </span>
              </div>
            </div>
          </div>

          <section className="grid gap-2.5" aria-label="Trạng thái phân công">
            <h3 className={D_LABEL_CLASS}>Trạng thái phân công</h3>
            {detail.lenhInfo && (
              <>
                <div>
                  <span className={`badge ${detail.lenhInfo.badgeClass}`}>
                    <Icon name={detail.lenhInfo.icon} />
                    {detail.lenhInfo.label}
                  </span>
                </div>
                <p className="text-[12px] leading-[1.55] text-[var(--slate-600)]">
                  {detail.lenhInfo.sub}
                </p>
              </>
            )}
            <div className="flex flex-wrap gap-2">
              {LENH_STEPS.map((step) => {
                const state = detail.steps[step.key] ?? "idle";
                return (
                  <span
                    key={step.key}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11.5px] font-semibold ${STEP_STATE_CLASS[state]}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full ${STEP_DOT_CLASS[state]}`}
                    />
                    {step.label}
                  </span>
                );
              })}
            </div>
            {detail.treText ? (
              <div className="mt-1 flex items-center gap-2 rounded-[10px] bg-[var(--red-50)] px-3 py-2.5 text-[12.5px] font-semibold text-[var(--red-600)]">
                <Icon name="i-alert" className="h-4 w-4 flex-none" />
                {detail.treText}
              </div>
            ) : null}
          </section>

          {trip.suco && detail.sucoState && (
            <section
              className="flex gap-3 rounded-xl border border-[var(--orange-100)] bg-[var(--orange-50)] p-3.5"
              role="alert"
              aria-label="Xử lý sự cố"
            >
              <span
                className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] bg-[var(--orange-100)] text-[var(--orange-700)]"
                aria-hidden="true"
              >
                <Icon name="i-alert" className="h-[18px] w-[18px]" />
              </span>
              <div className="grid min-w-0 gap-[5px]">
                <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                  <strong className="text-[13.5px] text-[var(--ink)]">
                    {detail.sucoState.title}
                  </strong>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${detail.sucoState.chipClass}`}
                  >
                    {detail.sucoState.chip}
                  </span>
                </div>
                <p className="text-[12.5px] leading-[1.55] text-[var(--slate-600)]">
                  {trip.suco.moTa} — tài xế đã báo.
                </p>

                <div className="mt-1 grid gap-2">
                  <div className="grid grid-cols-[12px_1fr] gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-1 h-2 w-2 rounded-full bg-[var(--orange-500)]"
                    />
                    <div>
                      <strong className="block text-[12.5px] text-[var(--ink)]">
                        Tài xế báo sự cố
                      </strong>
                      <span className="block text-[11px] text-[var(--slate-500)]">
                        {trip.suco.loai ? `${trip.suco.loai} · ` : ""}Báo lúc{" "}
                        {trip.suco.baoLuc}
                      </span>
                    </div>
                  </div>
                  {trip.suco.trangThai !== "mo" && (
                    <div className="grid grid-cols-[12px_1fr] gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-1 h-2 w-2 rounded-full bg-[var(--sky-500)]"
                      />
                      <div>
                        <strong className="block text-[12.5px] text-[var(--ink)]">
                          Admin nhận xử lý
                        </strong>
                        <span className="block text-[11px] text-[var(--slate-500)]">
                          {trip.suco.nguoiXuLy ?? "Quản trị viên"} ·{" "}
                          {bienPhapLabel(trip.suco.bienPhap)}
                        </span>
                      </div>
                    </div>
                  )}
                  {trip.suco.trangThai === "da-xu-ly" && (
                    <div className="grid grid-cols-[12px_1fr] gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-1 h-2 w-2 rounded-full bg-[var(--green-600)]"
                      />
                      <div>
                        <strong className="block text-[12.5px] text-[var(--ink)]">
                          Đã xử lý xong
                        </strong>
                        <span className="block text-[11px] text-[var(--slate-500)]">
                          {bienPhapLabel(trip.suco.bienPhapThuc)} ·{" "}
                          {trip.suco.dongLuc ?? "--"}
                        </span>
                        {trip.suco.ketQua && (
                          <p className="text-[12px] leading-[1.5] text-[var(--slate-600)]">
                            {trip.suco.ketQua}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {trip.suco.trangThai !== "da-xu-ly" && (
                  <div className="mt-1.5 flex flex-wrap gap-[7px]">
                    {trip.suco.trangThai === "mo" && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary !px-3.5"
                        onClick={() => onSuco(trip, "nhan")}
                      >
                        Bắt đầu xử lý
                      </button>
                    )}
                    {trip.suco.trangThai === "dang-xu-ly" && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary !px-3.5"
                        onClick={() => onSuco(trip, "ket-qua")}
                      >
                        Ghi nhận kết quả
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost !px-3.5"
                      onClick={() => onEdit(trip)}
                    >
                      Thay xe
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost !px-3.5"
                      onClick={() => onEdit(trip)}
                    >
                      Đổi tài xế
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {trip.trangThai === "da-huy" && (trip.lyDoHuy || trip.huyLuc) && (
            <section
              className="flex gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--bg)] p-3.5"
              aria-label="Thông tin hủy chuyến"
            >
              <span
                className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] bg-[var(--red-50)] text-[var(--red-600)]"
                aria-hidden="true"
              >
                <Icon name="i-x-circle" className="h-[18px] w-[18px]" />
              </span>
              <div className="grid min-w-0 gap-[5px]">
                <strong className="text-[13.5px] text-[var(--ink)]">
                  Hãng đã hủy chuyến
                </strong>
                {trip.lyDoHuy && (
                  <p className="text-[12.5px] leading-[1.55] text-[var(--slate-600)]">
                    Lý do: {trip.lyDoHuy}
                  </p>
                )}
                {trip.moTaHuy && (
                  <p className="text-[12.5px] leading-[1.55] text-[var(--slate-600)]">
                    {trip.moTaHuy}
                  </p>
                )}
                {trip.huyLuc && (
                  <span className="text-[11px] text-[var(--slate-500)]">
                    Hủy lúc {trip.huyLuc}
                  </span>
                )}
              </div>
            </section>
          )}

          <section className="grid gap-2.5" aria-label="Hành khách và vé">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className={D_LABEL_CLASS}>Hành khách & vé</h3>
                <p className="mt-0.5 text-[11.5px] leading-[1.5] text-[var(--slate-500)]">
                  Thanh toán tiền mặt do tài xế ghi ở D4
                </p>
              </div>
              <span className="badge badge--sky badge--sm">
                {detail.veList.length} vé
              </span>
            </div>

            {ticketsLoading ? (
              <div className="state-loading">Đang tải danh sách vé...</div>
            ) : ticketsError ? (
              <div className="grid justify-items-center gap-1 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-3.5 py-[22px] text-center">
                <Icon
                  name="i-alert"
                  className="h-[26px] w-[26px] text-[var(--red-600)]"
                />
                <strong className="text-[13.5px] text-[var(--ink)]">
                  Không tải được danh sách vé
                </strong>
                <span className="text-[12px] text-[var(--slate-500)]">
                  {ticketsErrorText}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-1"
                  onClick={() => void refetchTickets()}
                >
                  <Icon name="i-refresh" />
                  Thử lại
                </button>
              </div>
            ) : detail.veList.length > 0 ? (
              <ul>
                {detail.veList.map((ve) => (
                  <li
                    key={ve.id}
                    className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 border-b border-dashed border-[var(--border)] py-3 last:border-b-0 max-[560px]:grid-cols-[34px_minmax(0,1fr)]"
                  >
                    <span className="cv-avatar" aria-hidden="true">
                      {vietTat(ve.khach) || "?"}
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-[13.5px] font-semibold leading-[1.35] text-[var(--ink)]">
                        {ve.khach}
                      </strong>
                      <span className="mt-0.5 block text-[11.5px] leading-[1.45] text-[var(--slate-500)]">
                        <span className="text-[11px] font-bold text-[var(--sky-800)]">
                          {ve.maVe}
                        </span>{" "}
                        · Đón {ve.diemDon} → trả {ve.diemTra}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-[1.45] text-[var(--slate-500)]">
                        {ve.sdt ? `SĐT ${ve.sdt} · ` : ""}
                        {dinhDangTien(ve.tien)}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1 max-[560px]:col-start-2 max-[560px]:flex-row max-[560px]:flex-wrap max-[560px]:items-center max-[560px]:justify-between">
                      <span className="rounded-lg bg-[var(--navy-50)] px-[9px] py-[3px] [font-family:var(--font-heading)] text-xs font-bold text-[var(--navy-800)]">
                        {ve.ghe}
                      </span>
                      <span className="flex flex-wrap justify-end gap-1 max-[560px]:justify-start">
                        {ve.flags.map((flag) => (
                          <span
                            key={flag.label}
                            className={`badge badge--sm ${flag.badgeClass}`}
                          >
                            {flag.label}
                          </span>
                        ))}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid justify-items-center gap-1 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-3.5 py-[22px] text-center">
                <Icon name="i-ticket" className="h-[26px] w-[26px] text-[var(--slate-400)]" />
                <strong className="text-[13.5px] text-[var(--ink)]">
                  Chưa có vé nào
                </strong>
                <span className="text-[12px] text-[var(--slate-500)]">
                  Vé khách đặt sẽ xuất hiện ở đây.
                </span>
              </div>
            )}
          </section>

          <section className="grid gap-3.5" aria-label="Lịch sử trạng thái">
            <h3 className={D_LABEL_CLASS}>Lịch sử trạng thái</h3>
            <ol>
              {detail.timeline.map((item) => (
                <li
                  key={item.title}
                  className={`${TIMELINE_ITEM_CLASS} ${TIMELINE_LINE_CLASS}`}
                >
                  <span
                    aria-hidden="true"
                    className={`relative z-10 mt-1 h-[11px] w-[11px] rounded-full ${DOT_STATE_CLASS[item.state]}`}
                  />
                  <div>
                    <strong className="block text-[13.5px] font-bold text-[var(--ink)]">
                      {item.title}
                    </strong>
                    <span className="mt-px block text-[12px] text-[var(--slate-500)]">
                      {item.meta}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[var(--border-soft)] bg-[var(--surface)] px-5 pb-[18px] pt-3.5 max-[560px]:px-4">
          <p className="min-w-[180px] flex-1 text-[11.5px] leading-[1.5] text-[var(--slate-500)]">
            {detail.footNote}
          </p>
          <div className="flex flex-wrap justify-end gap-2 max-[400px]:flex-1 max-[400px]:flex-col max-[400px]:[&>*]:w-full">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Đóng
            </button>
            {(detail.canEdit || detail.canAssign) && (
              <button
                type="button"
                className="btn btn-ghost"
                title={detail.canEdit ? "Sửa chuyến này" : "Đổi xe và tài xế"}
                onClick={() => onEdit(trip)}
              >
                {detail.canEdit && !detail.hasAssignment
                  ? "Phân công chuyến"
                  : detail.canEdit
                    ? "Sửa chuyến"
                    : "Đổi xe và tài xế"}
              </button>
            )}
            {detail.canDelete ? (
              <button
                type="button"
                className="btn btn-danger"
                title="Xóa chuyến nháp này"
                onClick={() => onDelete(trip)}
              >
                Xóa nháp
              </button>
            ) : detail.canCancel ? (
              <button
                type="button"
                className="btn btn-danger"
                title="Hủy chuyến này"
                onClick={() => onCancel(trip)}
              >
                Hủy chuyến
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
