"use client";

import {
  DatePicker,
  FormField,
  Select,
  TextInput,
} from "@/components/ui/form";
import {
  GPLX_HANG_OPTIONS,
  type TaiXeFormPatchValues,
  type TaiXeFormState,
  type TaiXeFormValues,
} from "../_utils/tai-xe-form";
import { useTaiXeForm } from "../_hooks/use-tai-xe-form";

const FIELD_GRID_CLASS = [
  "tx-form-grid grid gap-3.5",
  "[grid-template-columns:1fr_1fr]",
  "max-[520px]:[grid-template-columns:1fr]",
].join(" ");

const FOOTER_CLASS = [
  "mt-1 flex flex-wrap justify-end gap-2.5",
  "border-t border-[var(--border-soft)] pt-4",
].join(" ");

type TaiXeFormBodyProps = {
  initial: TaiXeFormState;
  isEdit: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (values: TaiXeFormValues | TaiXeFormPatchValues) => void;
};

export function TaiXeFormBody({
  initial,
  isEdit,
  saving,
  onClose,
  onSave,
}: TaiXeFormBodyProps) {
  const {
    values,
    invalid,
    status,
    updateField,
    handleSubmit,
    fullNameRef,
    phoneRef,
    emailRef,
    licenseNumberRef,
    licenseClassRef,
    licenseExpiresOnRef,
  } = useTaiXeForm({ initial, saving, onSave, isEdit });

  return (
    <form className="grid gap-3.5" noValidate onSubmit={handleSubmit}>
      <div className={FIELD_GRID_CLASS}>
        <FormField
          id="tx-name"
          label="Họ và tên"
          required
          className="[grid-column:1/-1]"
          invalid={invalid.fullName}
        >
          <TextInput
            ref={fullNameRef}
            id="tx-name"
            type="text"
            placeholder="VD: Nguyễn Văn An"
            autoComplete="off"
            aria-invalid={invalid.fullName}
            invalid={invalid.fullName}
            value={values.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
          />
        </FormField>

        <FormField
          id="tx-phone"
          label="Số điện thoại"
          required
          invalid={invalid.phone}
        >
          <TextInput
            ref={phoneRef}
            id="tx-phone"
            type="tel"
            placeholder="VD: 0912 345 001"
            autoComplete="off"
            aria-invalid={invalid.phone}
            invalid={invalid.phone}
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </FormField>

        <FormField id="tx-email" label="Email" invalid={invalid.email}>
          <TextInput
            ref={emailRef}
            id="tx-email"
            type="email"
            placeholder="VD: an.nguyen@vivuviet.vn"
            autoComplete="off"
            aria-invalid={invalid.email}
            invalid={invalid.email}
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </FormField>

        <FormField
          id="tx-gplx"
          label="Số GPLX"
          required
          invalid={invalid.licenseNumber}
        >
          <TextInput
            ref={licenseNumberRef}
            id="tx-gplx"
            type="text"
            inputMode="numeric"
            placeholder="12 chữ số trên giấy phép"
            autoComplete="off"
            aria-invalid={invalid.licenseNumber}
            invalid={invalid.licenseNumber}
            value={values.licenseNumber}
            onChange={(event) =>
              updateField("licenseNumber", event.target.value)
            }
          />
        </FormField>

        <FormField
          id="tx-hang"
          label="Hạng GPLX"
          required
          invalid={invalid.licenseClass}
        >
          <Select
            ref={licenseClassRef}
            id="tx-hang"
            aria-invalid={invalid.licenseClass}
            invalid={invalid.licenseClass}
            value={values.licenseClass}
            onChange={(value) => updateField("licenseClass", value)}
            placeholder="— Chọn hạng —"
            options={[
              { value: "", label: "— Chọn hạng —" },
              ...GPLX_HANG_OPTIONS.map((option) => ({
                value: option,
                label: option,
              })),
            ]}
          />
        </FormField>

        <FormField
          id="tx-han"
          label="Hạn GPLX"
          required
          invalid={invalid.licenseExpiresOn}
        >
          <DatePicker
            ref={licenseExpiresOnRef}
            id="tx-han"
            aria-invalid={invalid.licenseExpiresOn}
            invalid={invalid.licenseExpiresOn}
            value={values.licenseExpiresOn}
            onChange={(value) => updateField("licenseExpiresOn", value)}
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
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={saving}
        >
          Hủy
        </button>
        <button
          type="submit"
          className={`btn btn-primary${saving ? " is-loading" : ""}`}
          disabled={saving}
        >
          {isEdit ? "Lưu thay đổi" : "Tạo tài khoản"}
        </button>
      </div>
    </form>
  );
}
