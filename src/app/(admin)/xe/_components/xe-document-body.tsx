"use client";

import { Icon } from "@/components/icons/icon";
import {
  DatePicker,
  FormField,
  TextArea,
  TextInput,
} from "@/components/ui/form";
import { cx } from "@/components/ui/form/utils";
import { XE_DOC_STATUS, XE_DOC_TYPES } from "../_data/documents";
import { useXeDocumentForm } from "../_hooks/use-xe-document-form";

const TABS_CLASS = "flex flex-wrap gap-2";

const TAB_BASE = [
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
  "text-[12.5px] font-bold transition-colors",
].join(" ");

const TAB_IDLE =
  "border-[var(--border)] bg-[var(--surface)] text-[var(--slate-600)] hover:border-[var(--slate-300)]";

const TAB_ACTIVE =
  "border-[var(--sky-300)] bg-[var(--sky-50)] text-[var(--sky-800)]";

const GRID_CLASS = [
  "grid gap-3.5 [grid-template-columns:repeat(2,minmax(0,1fr))]",
  "max-[520px]:[grid-template-columns:1fr]",
].join(" ");

const FOOTER_CLASS = [
  "mt-1 flex flex-wrap justify-end gap-2.5",
  "border-t border-[var(--border-soft)] pt-4",
].join(" ");

type XeDocumentBodyProps = {
  companyId: string;
  vehicleId: string;
  onClose: () => void;
  onSaved: (message: string) => void;
};

export function XeDocumentBody({
  companyId,
  vehicleId,
  onClose,
  onSaved,
}: XeDocumentBodyProps) {
  const {
    drafts,
    activeType,
    savedByType,
    error,
    ready,
    loadError,
    saving,
    refetch,
    patchField,
    setActive,
    submit,
  } = useXeDocumentForm({ companyId, vehicleId, onSaved });

  const draft = drafts[activeType];
  const saved = savedByType[activeType];
  const status = saved ? XE_DOC_STATUS[saved.status] : null;

  return (
    <form
      className="grid gap-3.5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div
        className={TABS_CLASS}
        role="tablist"
        aria-label="Loại giấy tờ xe"
      >
        {XE_DOC_TYPES.map((item) => {
          const isActive = item.value === activeType;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(item.value)}
              className={cx(TAB_BASE, isActive ? TAB_ACTIVE : TAB_IDLE)}
            >
              <Icon name="i-shield" className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {!ready ? (
        loadError ? (
          <div
            className="flex flex-wrap items-center gap-2.5"
            role="status"
            aria-live="polite"
          >
            <p className="form-status is-error">
              Không tải được giấy tờ hiện có — hãy thử lại trước khi lưu để tránh
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
          <div className="state-loading py-6">Đang tải giấy tờ xe...</div>
        )
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--slate-500)]">
            <span className="font-semibold text-[var(--slate-600)]">
              Trạng thái hiện tại:
            </span>
            {status ? (
              <span className={`badge ${status.badge}`}>
                <Icon name="i-check-circle" className="icon" />
                {status.label}
              </span>
            ) : (
              <span className="badge badge--slate">Chưa có giấy tờ</span>
            )}
          </div>

          <div className={GRID_CLASS}>
            <FormField id="doc-number" label="Số giấy tờ">
              <TextInput
                id="doc-number"
                type="text"
                autoComplete="off"
                placeholder="VD: 29A-12345 / số phôi"
                value={draft.documentNumber}
                onChange={(event) =>
                  patchField(activeType, "documentNumber", event.target.value)
                }
              />
            </FormField>
            <FormField id="doc-issuer" label="Nơi cấp">
              <TextInput
                id="doc-issuer"
                type="text"
                autoComplete="off"
                placeholder="VD: Cục CSGT / Công ty bảo hiểm"
                value={draft.issuer}
                onChange={(event) =>
                  patchField(activeType, "issuer", event.target.value)
                }
              />
            </FormField>
          </div>

          <div className={GRID_CLASS}>
            <FormField id="doc-issued" label="Ngày cấp">
              <DatePicker
                id="doc-issued"
                value={draft.issuedOn}
                onChange={(value) => patchField(activeType, "issuedOn", value)}
              />
            </FormField>
            <FormField id="doc-expires" label="Ngày hết hiệu lực">
              <DatePicker
                id="doc-expires"
                value={draft.expiresOn}
                min={draft.issuedOn || undefined}
                onChange={(value) => patchField(activeType, "expiresOn", value)}
              />
            </FormField>
          </div>

          <FormField id="doc-description" label="Ghi chú">
            <TextArea
              id="doc-description"
              placeholder="Thông tin thêm về giấy tờ (không bắt buộc)"
              value={draft.description}
              onChange={(event) =>
                patchField(activeType, "description", event.target.value)
              }
            />
          </FormField>

          <p className="text-[12px] leading-snug text-[var(--slate-500)]">
            Lưu sẽ ghi đè toàn bộ giấy tờ của loại đang chọn; để trống một trường
            sẽ xóa giá trị cũ của trường đó. Trạng thái hiệu lực do backend tính
            theo ngày hết hiệu lực.
          </p>

          {error && (
            <p className="form-status is-error" role="status" aria-live="polite">
              {error}
            </p>
          )}

          <div className={FOOTER_CLASS}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Đóng
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!ready || saving}
            >
              {saving ? "Đang lưu..." : "Lưu giấy tờ"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
