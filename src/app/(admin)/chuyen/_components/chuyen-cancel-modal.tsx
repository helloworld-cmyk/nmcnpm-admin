"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Modal } from "@/components/ui/modal";
import { FormField, Select, TextArea } from "@/components/ui/form";
import { LY_DO_HUY, type ChuyenRecord } from "../_data/chuyen";

type ChuyenCancelModalProps = {
  trip: ChuyenRecord | null;
  onClose: () => void;
  onConfirm: (ma: string) => void;
};

export function ChuyenCancelModal({
  trip,
  onClose,
  onConfirm,
}: ChuyenCancelModalProps) {
  const [lyDo, setLyDo] = useState("");
  const [moTa, setMoTa] = useState("");
  const [lyDoInvalid, setLyDoInvalid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lyDoRef = useRef<HTMLButtonElement>(null);

  const handleConfirm = () => {
    if (!trip) return;
    if (!lyDo) {
      setLyDoInvalid(true);
      setError("Chọn lý do hủy trước khi xác nhận.");
      lyDoRef.current?.focus();
      return;
    }
    onConfirm(trip.ma);
  };

  return (
    <Modal
      open={trip !== null}
      onClose={onClose}
      size="sm"
      title={
        trip ? (
          <span className="block">
            <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sky-700)]">
              Xử lý chuyến
            </span>
            <span className="block text-[18px] leading-[1.25]">
              Hủy chuyến {trip.ma}
            </span>
          </span>
        ) : (
          ""
        )
      }
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Giữ chuyến
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
          >
            Xác nhận hủy chuyến
          </button>
        </>
      }
    >
      {trip && (
        <>
          <p className="text-[13.5px] leading-[1.65] text-[var(--slate-600)]">
            Hủy chuyến <strong className="text-[var(--ink)]">{trip.ma}</strong>.{" "}
            <strong className="text-[var(--ink)]">{trip.daDat}</strong> vé đã
            đặt sẽ chuyển sang <strong className="text-[var(--ink)]">Đã hủy</strong>{" "}
            — không phát sinh hoàn tiền; các vé này vào danh sách xử lý ở Quản
            lý đơn đặt.
          </p>

          <div
            role="note"
            className="flex gap-2.5 rounded-[var(--radius-sm)] border border-[var(--orange-100)] bg-[var(--orange-50)] p-3 text-[12.5px] leading-[1.55] text-[var(--slate-700)]"
          >
            <Icon
              name="i-alert"
              className="h-[18px] w-[18px] flex-none text-[var(--orange-600)]"
            />
            <p>
              Chỉ hủy được chuyến chưa bắt đầu. Chuyến đang thực hiện xử lý qua
              báo sự cố, không hủy trực tiếp.
            </p>
          </div>

          <FormField
            id="fLyDo"
            label="Lý do hủy"
            required
            invalid={lyDoInvalid}
          >
            <Select
              ref={lyDoRef}
              id="fLyDo"
              name="lydo"
              icon="i-alert"
              value={lyDo}
              aria-invalid={lyDoInvalid}
              invalid={lyDoInvalid}
              placeholder="— Chọn lý do —"
              onChange={(value) => {
                setLyDo(value);
                if (lyDoInvalid) {
                  setLyDoInvalid(false);
                  setError(null);
                }
              }}
              options={[
                { value: "", label: "— Chọn lý do —" },
                ...LY_DO_HUY.map((item) => ({
                  value: item.value,
                  label: item.label,
                })),
              ]}
            />
          </FormField>

          <FormField id="fMoTaHuy" label="Mô tả thêm">
            <TextArea
              id="fMoTaHuy"
              name="mota"
              rows={3}
              placeholder="Ghi rõ nguyên nhân để đối soát với khách"
              value={moTa}
              onChange={(event) => setMoTa(event.target.value)}
            />
          </FormField>

          <p
            className={`form-status${error ? " is-error" : ""}`}
            role="status"
            aria-live="polite"
          >
            {error}
          </p>
        </>
      )}
    </Modal>
  );
}
