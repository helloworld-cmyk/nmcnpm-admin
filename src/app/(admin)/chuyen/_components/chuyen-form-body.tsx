"use client";

import {
  DatePicker,
  FormField,
  Select,
  TimePicker,
} from "@/components/ui/form";
import { Icon } from "@/components/icons/icon";
import type {
  ChuyenRecord,
  ChuyenTuyenOption,
  TaiXeOption,
  XeOption,
} from "../_data/chuyen";
import {
  useChuyenForm,
  type ChuyenFormFields,
  type ChuyenFormValues,
} from "../_hooks/use-chuyen-form";
import { busyCua, busyLabel } from "../_utils/chuyen-form";
import { AvailRow } from "./avail-row";

const FORM_GRID_CLASS =
  "grid grid-cols-1 gap-3.5 min-[560px]:grid-cols-2 min-[560px]:items-start";

type ChuyenFormBodyProps = {
  initial: ChuyenFormFields;
  editingId: string | null;
  scheduleLocked: boolean;
  canPublish: boolean;
  trips: ChuyenRecord[];
  tuyenOptions: ChuyenTuyenOption[];
  routeDurations: Record<string, number>;
  xeOptions: XeOption[];
  taixeOptions: TaiXeOption[];
  /* Đang gọi API tạo/sửa → khóa nút và chặn submit trùng. */
  saving?: boolean;
  onClose: () => void;
  onSave: (values: ChuyenFormValues, publish: boolean) => void;
};

export function ChuyenFormBody({
  initial,
  editingId,
  scheduleLocked,
  canPublish,
  trips,
  tuyenOptions,
  routeDurations,
  xeOptions,
  taixeOptions,
  saving = false,
  onClose,
  onSave,
}: ChuyenFormBodyProps) {
  const {
    values,
    invalid,
    status,
    updateField,
    handleSubmit,
    handleSaveAndPublish,
    tuyenRef,
    ngayRef,
    gioRef,
    xeRef,
    taixeRef,
    khiLabel,
    availNote,
    busyXe,
    busyTx,
    plan,
    trungLich,
    clashXe,
    clashTx,
    taixeDangChon,
  } = useChuyenForm({
    initial,
    editingId,
    trips,
    routeDurations,
    taixeOptions,
    saving,
    onSave,
  });

  return (
    <form className="grid gap-3.5" noValidate onSubmit={handleSubmit}>
      {scheduleLocked && (
        <p
          role="note"
          className="rounded-[var(--radius-sm)] border border-[var(--sky-100)] bg-[var(--sky-50)] p-3 text-[12.5px] leading-[1.55] text-[var(--slate-700)]"
        >
          Chuyến đã công bố nên không sửa được tuyến/ngày/giờ khởi hành, chỉ có
          thể thay xe và tài xế.
        </p>
      )}
      <div className={FORM_GRID_CLASS}>
        <FormField
          id="fTuyenChon"
          label="Tuyến"
          required
          className="min-[560px]:col-span-2"
          invalid={invalid.tuyen}
        >
          <Select
            ref={tuyenRef}
            id="fTuyenChon"
            name="tuyen"
            icon="i-route"
            disabled={scheduleLocked}
            aria-invalid={invalid.tuyen}
            invalid={invalid.tuyen}
            value={values.tuyen}
            onChange={(value) => updateField("tuyen", value)}
            placeholder="— Chọn tuyến đang hoạt động —"
            options={[
              { value: "", label: "— Chọn tuyến đang hoạt động —" },
              ...tuyenOptions.map((option) => ({
                value: option.value,
                label: option.label,
              })),
            ]}
          />
        </FormField>

        <FormField
          id="fNgayDi"
          label="Ngày khởi hành"
          required
          invalid={invalid.ngay}
        >
          <DatePicker
            ref={ngayRef}
            id="fNgayDi"
            icon="i-calendar"
            disabled={scheduleLocked}
            aria-invalid={invalid.ngay}
            invalid={invalid.ngay}
            value={values.ngay}
            onChange={(value) => updateField("ngay", value)}
          />
        </FormField>

        <FormField
          id="fGioDi"
          label="Giờ khởi hành"
          required
          invalid={invalid.gio}
        >
          <TimePicker
            ref={gioRef}
            id="fGioDi"
            icon="i-clock"
            disabled={scheduleLocked}
            aria-invalid={invalid.gio}
            invalid={invalid.gio}
            value={values.gio}
            onChange={(value) => updateField("gio", value)}
          />
        </FormField>

        <FormField id="fXeChon" label="Xe" required invalid={invalid.xe}>
          <Select
            ref={xeRef}
            id="fXeChon"
            name="xe"
            icon="i-car"
            aria-invalid={invalid.xe}
            invalid={invalid.xe}
            value={values.xe}
            onChange={(value) => updateField("xe", value)}
            placeholder="— Chọn xe đang hoạt động —"
            options={[
              { value: "", label: "— Chọn xe đang hoạt động —" },
              ...xeOptions.map((option) => {
                const trung = trungLich(busyXe, option.value);
                return {
                  value: option.value,
                  label: trung ? `${option.label} · trùng lịch` : option.label,
                  disabled: trung && option.value !== values.xe,
                };
              }),
            ]}
          />
        </FormField>

        <FormField
          id="fTaiXeChon"
          label="Tài xế"
          required
          invalid={invalid.taixe}
        >
          <Select
            ref={taixeRef}
            id="fTaiXeChon"
            name="taixe"
            icon="i-user"
            aria-invalid={invalid.taixe}
            invalid={invalid.taixe}
            value={values.taixe}
            onChange={(value) => updateField("taixe", value)}
            placeholder="— Chọn tài xế đang hoạt động —"
            options={[
              { value: "", label: "— Chọn tài xế đang hoạt động —" },
              ...taixeOptions.map((option) => {
                const trung = trungLich(busyTx, option.value);
                return {
                  value: option.value,
                  label: trung ? `${option.label} · trùng lịch` : option.label,
                  disabled: trung && option.value !== values.taixe,
                };
              }),
            ]}
          />
        </FormField>
      </div>

      <section
        className="mt-1 grid gap-2.5 rounded-xl border border-[var(--sky-100)] bg-[var(--sky-50)] p-3.5"
        aria-label="Tình trạng tài nguyên"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-1.5">
          <strong className="text-[12.5px] text-[var(--ink)]">
            Tình trạng tài nguyên
          </strong>
          <span className="text-[11.5px] text-[var(--slate-600)]">{khiLabel}</span>
        </div>

        <AvailRow
          name={values.xe || "Chưa chọn xe"}
          busy={busyCua(busyXe, values.xe)}
          plan={plan}
          label={`${values.xe || "Xe"} · ${busyLabel(busyCua(busyXe, values.xe))}`}
        />
        <AvailRow
          name={taixeDangChon || "Chưa chọn tài xế"}
          busy={busyCua(busyTx, values.taixe)}
          plan={plan}
          label={`${taixeDangChon || "Tài xế"} · ${busyLabel(busyCua(busyTx, values.taixe))}`}
        />

        <p
          className={`text-[11.5px] leading-[1.5] ${
            clashXe || clashTx
              ? "font-bold text-[var(--red-600)]"
              : "text-[var(--slate-600)]"
          }`}
        >
          {availNote}
        </p>
      </section>

      <p
        className={`form-status${status ? " is-error" : ""}`}
        role="status"
        aria-live="polite"
      >
        {status}
      </p>

      <div className="mt-1 flex flex-wrap justify-end gap-2.5 border-t border-[var(--border-soft)] pt-4">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Đóng
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu chuyến"}
        </button>
        {canPublish && (
          <button
            type="button"
            className="btn btn-sky"
            disabled={saving}
            onClick={handleSaveAndPublish}
          >
            <Icon name="i-publish" />
            Lưu và công bố chuyến
          </button>
        )}
      </div>
    </form>
  );
}
