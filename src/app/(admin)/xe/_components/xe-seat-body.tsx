"use client";

import { Icon } from "@/components/icons/icon";
import { FormField, TextInput } from "@/components/ui/form";
import { cx } from "@/components/ui/form/utils";
import {
  SEAT_EMPTY,
  SEAT_FILLED,
  SEAT_LIMITS,
  type XeSeatTarget,
} from "../_data/seats";
import { useXeSeatForm } from "../_hooks/use-xe-seat-form";

const CELL_BASE = [
  "flex h-11 min-w-0 items-center justify-center gap-1 rounded-[var(--radius-xs)]",
  "border text-[12.5px] font-bold transition-transform",
  "hover:-translate-y-px focus-visible:outline-none focus-visible:ring-4",
  "focus-visible:ring-[rgba(14,165,233,0.15)]",
].join(" ");

const CELL_FILLED =
  "border-[var(--sky-300)] bg-[var(--sky-50)] text-[var(--sky-800)]";

const CELL_EMPTY = [
  "border-dashed border-[var(--slate-300)] bg-transparent",
  "text-[var(--slate-400)] hover:border-[var(--slate-400)]",
].join(" ");

const GRID_CLASS =
  "grid gap-2 rounded-[var(--radius-md)] bg-[var(--navy-50)] p-3";

const PALETTE_BASE = [
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
  "text-[12.5px] font-bold transition-colors",
].join(" ");

const PALETTE_IDLE =
  "border-[var(--border)] bg-[var(--surface)] text-[var(--slate-600)] hover:border-[var(--slate-300)]";

const DIM_GRID_CLASS = [
  "grid gap-3.5 [grid-template-columns:repeat(2,minmax(0,1fr))]",
  "max-[520px]:[grid-template-columns:1fr]",
].join(" ");

const TOOLBAR_CLASS = [
  "flex flex-wrap items-center justify-between gap-3",
  "border-t border-[var(--border-soft)] pt-3.5",
].join(" ");

const LEGEND_CLASS =
  "flex flex-wrap items-center gap-3 text-[12px] font-semibold text-[var(--slate-500)]";

const FOOTER_CLASS = [
  "mt-1 flex flex-wrap justify-end gap-2.5",
  "border-t border-[var(--border-soft)] pt-4",
].join(" ");

const SWATCH_CLASS =
  "inline-block h-3.5 w-3.5 flex-none rounded-[4px] border";

function clampDim(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type XeSeatBodyProps = {
  companyId: string;
  target: XeSeatTarget;
  onClose: () => void;
  onSaved: (message: string) => void;
};

export function XeSeatBody({
  companyId,
  target,
  onClose,
  onSaved,
}: XeSeatBodyProps) {
  const {
    state,
    cells,
    brush,
    setBrush,
    totalSeats,
    error,
    nameInvalid,
    nameRef,
    ready,
    isLoading,
    loadError,
    saving,
    refetch,
    patchState,
    paintCell,
    paintAll,
    clearAll,
    submit,
  } = useXeSeatForm({
    companyId,
    vehicleId: target.vehicleId,
    onSaved,
  });

  const setDim = (
    field: "rows" | "cols",
    raw: string,
    min: number,
    max: number
  ) => {
    const parsed = Number(raw);
    const value = Number.isFinite(parsed)
      ? clampDim(Math.round(parsed), min, max)
      : min;
    patchState({ [field]: value });
  };

  return (
    <form
      className="grid gap-3.5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <FormField
        id="seat-name"
        label="Tên sơ đồ ghế"
        required
        invalid={nameInvalid}
      >
        <TextInput
          ref={nameRef}
          id="seat-name"
          type="text"
          autoComplete="off"
          placeholder="VD: Ford Transit 16 chỗ"
          aria-invalid={nameInvalid}
          invalid={nameInvalid}
          disabled={!ready}
          value={state.name}
          onChange={(event) => patchState({ name: event.target.value })}
        />
      </FormField>

      <div className={DIM_GRID_CLASS}>
        <FormField id="seat-rows" label="Số hàng">
          <TextInput
            id="seat-rows"
            type="number"
            min={SEAT_LIMITS.rows.min}
            max={SEAT_LIMITS.rows.max}
            disabled={!ready}
            value={state.rows}
            onChange={(event) =>
              setDim(
                "rows",
                event.target.value,
                SEAT_LIMITS.rows.min,
                SEAT_LIMITS.rows.max
              )
            }
          />
        </FormField>
        <FormField id="seat-cols" label="Số cột">
          <TextInput
            id="seat-cols"
            type="number"
            min={SEAT_LIMITS.columns.min}
            max={SEAT_LIMITS.columns.max}
            disabled={!ready}
            value={state.cols}
            onChange={(event) =>
              setDim(
                "cols",
                event.target.value,
                SEAT_LIMITS.columns.min,
                SEAT_LIMITS.columns.max
              )
            }
          />
        </FormField>
      </div>

      <FormField
        id="seat-palette"
        label="Chọn rồi bấm vào ô để tô ghế hoặc lối đi"
      >
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Bảng tô ô ghế"
        >
          <button
            type="button"
            aria-pressed={brush === SEAT_FILLED}
            disabled={!ready}
            onClick={() => setBrush(SEAT_FILLED)}
            className={cx(
              PALETTE_BASE,
              brush === SEAT_FILLED ? CELL_FILLED : PALETTE_IDLE,
              brush === SEAT_FILLED && "ring-2 ring-[rgba(14,165,233,0.25)]"
            )}
          >
            <span className={cx(SWATCH_CLASS, "border-[var(--sky-300)] bg-[var(--sky-100)]")} />
            Ghế
          </button>
          <button
            type="button"
            aria-pressed={brush === SEAT_EMPTY}
            disabled={!ready}
            onClick={() => setBrush(SEAT_EMPTY)}
            className={cx(
              PALETTE_BASE,
              brush === SEAT_EMPTY ? CELL_EMPTY : PALETTE_IDLE,
              brush === SEAT_EMPTY && "ring-2 ring-[rgba(100,116,139,0.25)]"
            )}
          >
            <Icon name="i-close" className="h-3.5 w-3.5" />
            Ô trống (lối đi)
          </button>
        </div>
      </FormField>

      {isLoading ? (
        <div className="state-loading py-6">Đang tải sơ đồ ghế...</div>
      ) : ready ? (
        <div
          className={GRID_CLASS}
          style={{ gridTemplateColumns: `repeat(${state.cols}, minmax(0, 1fr))` }}
          aria-label="Sơ đồ ghế"
        >
          {cells.map((cell) => (
            <button
              key={cell.key}
              type="button"
              onClick={() => paintCell(cell.row, cell.col)}
              title={
                cell.filled
                  ? cell.seatCode
                  : "Ô trống — bấm để đặt ghế"
              }
              aria-label={`Ô hàng ${cell.row} cột ${cell.col}: ${
                cell.filled ? `ghế ${cell.seatCode}` : "ô trống"
              }`}
              className={cx(CELL_BASE, cell.filled ? CELL_FILLED : CELL_EMPTY)}
            >
              {cell.filled ? (
                cell.seatCode
              ) : (
                <Icon name="i-close" className="h-3.5 w-3.5" />
              )}
            </button>
          ))}
        </div>
      ) : null}

      <div className={TOOLBAR_CLASS}>
        <div className={LEGEND_CLASS}>
          <span className="inline-flex items-center gap-1.5">
            <span
              className={cx(SWATCH_CLASS, "border-[var(--sky-300)] bg-[var(--sky-100)]")}
            />
            Ghế
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={cx(SWATCH_CLASS, "border-dashed bg-transparent")} />
            Ô trống
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-bold text-[var(--slate-600)]">
            {totalSeats} ghế
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={!ready}
            onClick={paintAll}
          >
            <Icon name="i-grid" />
            Tô tất cả
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={!ready}
            onClick={clearAll}
          >
            <Icon name="i-refresh" />
            Xóa hết
          </button>
        </div>
      </div>

      {loadError ? (
        <div
          className="flex flex-wrap items-center gap-2.5"
          role="status"
          aria-live="polite"
        >
          <p className="form-status is-error">
            Không tải được sơ đồ ghế hiện tại — hãy thử lại trước khi lưu để tránh
            ghi đè.
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
      ) : (
        error && (
          <p className="form-status is-error" role="status" aria-live="polite">
            {error}
          </p>
        )
      )}

      <p className="text-[12px] leading-snug text-[var(--slate-500)]">
        Sơ đồ một tầng, không phân hạng ghế. Lưu sơ đồ sẽ cập nhật sức chứa của
        xe bằng đúng số ghế ({totalSeats} ghế). Mỗi lần lưu tạo một phiên bản sơ
        đồ mới, không ảnh hưởng chuyến đã mở bán.
      </p>

      <div className={FOOTER_CLASS}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Hủy
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!ready || saving}
        >
          {saving ? "Đang lưu..." : "Lưu sơ đồ ghế"}
        </button>
      </div>
    </form>
  );
}
