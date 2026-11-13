"use client";

import { FormField, Select, TextInput } from "@/components/ui/form";
import type { AreaResponse } from "@/api/area/api/get-areas";
import type { RouteResponse } from "@/api/tuyen-duong/api/types";
import type { TuyenDuongFormValues } from "../_data/tuyen-duong";
import type { TuyenDuongFormState } from "../_utils/tuyen-duong-form";
import { useTuyenDuongForm } from "../_hooks/use-tuyen-duong-form";

const FIELD_GRID_CLASS =
  "td-form-grid grid gap-3.5 [grid-template-columns:1fr_1fr] max-[520px]:[grid-template-columns:1fr]";

type TuyenDuongFormBodyProps = {
  initial: TuyenDuongFormState;
  isEdit: boolean;
  excludeId?: string;
  routes: RouteResponse[];
  areas: AreaResponse[];
  areasLoading: boolean;
  onClose: () => void;
  onSave: (values: TuyenDuongFormValues) => Promise<void>;
};

export function TuyenDuongFormBody({
  initial,
  isEdit,
  excludeId,
  routes,
  areas,
  areasLoading,
  onClose,
  onSave,
}: TuyenDuongFormBodyProps) {
  const {
    values,
    invalid,
    status,
    saving,
    updateField,
    handleSubmit,
    codeRef,
    nameRef,
    originRef,
    destinationRef,
    kmRef,
    minRef,
    priceRef,
  } = useTuyenDuongForm({ initial, excludeId, routes, areas, onSave });

  return (
    <form className="grid gap-3.5" noValidate onSubmit={handleSubmit}>
      <div className={FIELD_GRID_CLASS}>
        <FormField
          id="td-rf-code"
          label="Mã tuyến"
          required
          invalid={invalid.code}
        >
          <TextInput
            ref={codeRef}
            id="td-rf-code"
            type="text"
            placeholder="Ví dụ: TUY-09"
            autoComplete="off"
            aria-invalid={invalid.code}
            invalid={invalid.code}
            value={values.code}
            onChange={(event) => updateField("code", event.target.value)}
          />
        </FormField>

        <FormField id="td-rf-name" label="Tên tuyến" invalid={invalid.name}>
          <TextInput
            ref={nameRef}
            id="td-rf-name"
            type="text"
            placeholder="Bỏ trống để tự sinh từ điểm đi – điểm đến"
            autoComplete="off"
            aria-invalid={invalid.name}
            invalid={invalid.name}
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </FormField>

        <FormField
          id="td-rf-from"
          label="Điểm đi"
          required
          invalid={invalid.origin}
        >
          <Select
            ref={originRef}
            id="td-rf-from"
            aria-invalid={invalid.origin}
            invalid={invalid.origin}
            disabled={areasLoading}
            value={values.originAreaId}
            onChange={(value) => updateField("originAreaId", value)}
            placeholder={areasLoading ? "Đang tải địa điểm..." : "— Chọn điểm đi —"}
            options={[
              {
                value: "",
                label: areasLoading ? "Đang tải địa điểm..." : "— Chọn điểm đi —",
              },
              ...areas.map((area) => ({
                value: area.id,
                label: area.name,
              })),
            ]}
          />
        </FormField>

        <FormField
          id="td-rf-to"
          label="Điểm đến"
          required
          invalid={invalid.destination}
        >
          <Select
            ref={destinationRef}
            id="td-rf-to"
            aria-invalid={invalid.destination}
            invalid={invalid.destination}
            disabled={areasLoading}
            value={values.destinationAreaId}
            onChange={(value) => updateField("destinationAreaId", value)}
            placeholder={areasLoading ? "Đang tải địa điểm..." : "— Chọn điểm đến —"}
            options={[
              {
                value: "",
                label: areasLoading ? "Đang tải địa điểm..." : "— Chọn điểm đến —",
              },
              ...areas.map((area) => ({
                value: area.id,
                label: area.name,
              })),
            ]}
          />
        </FormField>

        <FormField
          id="td-rf-km"
          label="Khoảng cách (km)"
          required
          invalid={invalid.km}
        >
          <TextInput
            ref={kmRef}
            id="td-rf-km"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="Ví dụ: 120"
            aria-invalid={invalid.km}
            invalid={invalid.km}
            value={values.km}
            onChange={(event) => updateField("km", event.target.value)}
          />
        </FormField>

        <FormField
          id="td-rf-min"
          label="Thời lượng dự kiến (phút)"
          required
          invalid={invalid.min}
        >
          <TextInput
            ref={minRef}
            id="td-rf-min"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="Ví dụ: 135"
            aria-invalid={invalid.min}
            invalid={invalid.min}
            value={values.min}
            onChange={(event) => updateField("min", event.target.value)}
          />
        </FormField>

        <FormField
          id="td-rf-price"
          label="Giá vé cơ bản (đ)"
          required
          className="[grid-column:1/-1]"
          invalid={invalid.price}
        >
          <TextInput
            ref={priceRef}
            id="td-rf-price"
            type="number"
            min={0}
            step={1000}
            inputMode="numeric"
            placeholder="Ví dụ: 180000"
            aria-invalid={invalid.price}
            invalid={invalid.price}
            value={values.price}
            onChange={(event) => updateField("price", event.target.value)}
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

      <div className="mt-1 flex flex-wrap justify-end gap-2.5 border-t border-[var(--border-soft)] pt-4">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={saving}
        >
          Hủy
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Lưu tuyến"}
        </button>
      </div>
    </form>
  );
}
