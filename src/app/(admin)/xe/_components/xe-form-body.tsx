"use client";

import { FormField, Select, TextInput } from "@/components/ui/form";
import {
  XE_TRANG_THAI_OPTIONS,
  type Xe,
  type XeFormValues,
  type XeTrangThai,
} from "../_data/vehicles";
import type { XeFormState } from "../_utils/xe-form";
import { useXeForm } from "../_hooks/use-xe-form";

const FIELD_GRID_CLASS = [
  "grid gap-3.5",
  "[grid-template-columns:1fr_1fr]",
  "max-[520px]:[grid-template-columns:1fr]",
].join(" ");

const FOOTER_CLASS = [
  "mt-1 flex flex-wrap justify-end gap-2.5",
  "border-t border-[var(--border-soft)] pt-4",
].join(" ");

type XeFormBodyProps = {
  initial: XeFormState;
  isEdit: boolean;
  excludeId?: string;
  capacityLocked: boolean;
  vehicles: Xe[];
  onClose: () => void;
  onSave: (values: XeFormValues) => void;
};

export function XeFormBody({
  initial,
  isEdit,
  excludeId,
  capacityLocked,
  vehicles,
  onClose,
  onSave,
}: XeFormBodyProps) {
  const {
    values,
    invalid,
    status,
    updateField,
    handleSubmit,
    bienSoRef,
    loaiXeRef,
    soChoRef,
  } = useXeForm({ initial, vehicles, excludeId, onSave });

  return (
    <form className="grid gap-3.5" noValidate onSubmit={handleSubmit}>
      <div className={FIELD_GRID_CLASS}>
        <FormField
          id="v-bien-so"
          label="Biển số"
          required
          invalid={invalid.bienSo}
        >
          <TextInput
            ref={bienSoRef}
            id="v-bien-so"
            type="text"
            placeholder="VD: 29A-123.45"
            autoComplete="off"
            aria-invalid={invalid.bienSo}
            invalid={invalid.bienSo}
            value={values.bienSo}
            onChange={(event) => updateField("bienSo", event.target.value)}
          />
        </FormField>

        <FormField
          id="v-so-cho"
          label="Sức chứa (số chỗ)"
          required
          invalid={invalid.soCho}
          hint={
            capacityLocked
              ? "Sức chứa lấy theo sơ đồ ghế đã cấu hình — sửa ở nút “Sơ đồ ghế”."
              : undefined
          }
        >
          <TextInput
            ref={soChoRef}
            id="v-so-cho"
            type="number"
            min={1}
            max={50}
            placeholder="VD: 16"
            disabled={capacityLocked}
            aria-invalid={invalid.soCho}
            invalid={invalid.soCho}
            value={values.soCho}
            onChange={(event) => updateField("soCho", event.target.value)}
          />
        </FormField>

        <FormField
          id="v-loai-xe"
          label="Loại xe"
          required
          className="[grid-column:1/-1]"
          invalid={invalid.loaiXe}
        >
          <TextInput
            ref={loaiXeRef}
            id="v-loai-xe"
            type="text"
            placeholder="VD: Ford Transit 16 chỗ"
            autoComplete="off"
            aria-invalid={invalid.loaiXe}
            invalid={invalid.loaiXe}
            value={values.loaiXe}
            onChange={(event) => updateField("loaiXe", event.target.value)}
          />
        </FormField>

        <FormField id="v-trang-thai" label="Tình trạng">
          <Select
            id="v-trang-thai"
            value={values.trangThai}
            onChange={(value) =>
              updateField("trangThai", value as XeTrangThai)
            }
            options={XE_TRANG_THAI_OPTIONS.map((option) => ({
              value: option,
              label: option,
            }))}
          />
        </FormField>
      </div>

      <p
        className={`form-status${status ? " is-error" : ""}`}
        role="status"
        aria-live="polite"
      >
        {status}
      </p>

      <div className={FOOTER_CLASS}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Hủy
        </button>
        <button type="submit" className="btn btn-primary">
          {isEdit ? "Lưu thay đổi" : "Lưu xe"}
        </button>
      </div>
    </form>
  );
}
