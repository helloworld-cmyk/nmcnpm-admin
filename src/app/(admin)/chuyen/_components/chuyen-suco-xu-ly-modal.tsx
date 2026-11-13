"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Modal } from "@/components/ui/modal";
import { FormField, Select, TextArea } from "@/components/ui/form";
import {
  BIEN_PHAP_OPTIONS,
  NGUOI_XU_LY_OPTIONS,
  type ChuyenRecord,
} from "../_data/chuyen";

const STEP_HINT_CLASS =
  "flex gap-2.5 rounded-[var(--radius-sm)] border border-[var(--sky-100)] bg-[var(--sky-50)] p-3 text-[12px] leading-[1.55] text-[var(--slate-700)]";

type ChuyenSucoXuLyModalProps = {
  trip: ChuyenRecord | null;
  onClose: () => void;
  onConfirm: (
    tripId: string,
    data: { nguoi: string; bienPhap: string }
  ) => void;
};

export function ChuyenSucoXuLyModal({
  trip,
  onClose,
  onConfirm,
}: ChuyenSucoXuLyModalProps) {
  const [nguoi, setNguoi] = useState("");
  const [bienPhap, setBienPhap] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [invalid, setInvalid] = useState({ nguoi: false, bienPhap: false });
  const [error, setError] = useState<string | null>(null);
  const nguoiRef = useRef<HTMLButtonElement>(null);
  const bienPhapRef = useRef<HTMLButtonElement>(null);

  const handleConfirm = () => {
    if (!trip) return;
    if (!nguoi || !bienPhap) {
      setInvalid({ nguoi: !nguoi, bienPhap: !bienPhap });
      setError("Chọn người xử lý và biện pháp dự kiến.");
      (nguoi ? bienPhapRef : nguoiRef).current?.focus();
      return;
    }
    onConfirm(trip.id, { nguoi, bienPhap });
  };

  return (
    <Modal
      open={trip !== null}
      onClose={onClose}
      size="sm"
      title={
        <span className="block">
          <span className="block text-[18px] leading-[1.25]">
            Bắt đầu xử lý sự cố
          </span>
          <span className="mt-1 block text-[12.5px] font-medium leading-snug tracking-normal text-[var(--slate-500)]">
            Ghi nhận người phụ trách và biện pháp dự kiến cho chuyến{" "}
            <strong className="font-bold">{trip?.ma}</strong>.
          </span>
        </span>
      }
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
          >
            Nhận xử lý
          </button>
        </>
      }
    >
      {trip && (
        <>
          <div className={STEP_HINT_CLASS}>
            <Icon
              name="i-alert"
              className="h-[17px] w-[17px] flex-none text-[var(--sky-600)]"
            />
            <p>{trip.suco?.moTa}</p>
          </div>

          <FormField
            id="fsNguoiXuLy"
            label="Người xử lý"
            required
            invalid={invalid.nguoi}
          >
            <Select
              ref={nguoiRef}
              id="fsNguoiXuLy"
              name="nguoi"
              icon="i-user"
              value={nguoi}
              aria-invalid={invalid.nguoi}
              invalid={invalid.nguoi}
              placeholder="— Chọn người phụ trách —"
              onChange={(value) => {
                setNguoi(value);
                setInvalid((prev) => ({ ...prev, nguoi: false }));
                setError(null);
              }}
              options={[
                { value: "", label: "— Chọn người phụ trách —" },
                ...NGUOI_XU_LY_OPTIONS.map((item) => ({
                  value: item,
                  label: item,
                })),
              ]}
            />
          </FormField>

          <FormField
            id="fsBienPhap"
            label="Biện pháp dự kiến"
            required
            invalid={invalid.bienPhap}
          >
            <Select
              ref={bienPhapRef}
              id="fsBienPhap"
              name="bienphap"
              icon="i-list"
              value={bienPhap}
              aria-invalid={invalid.bienPhap}
              invalid={invalid.bienPhap}
              placeholder="— Chọn biện pháp —"
              onChange={(value) => {
                setBienPhap(value);
                setInvalid((prev) => ({ ...prev, bienPhap: false }));
                setError(null);
              }}
              options={[
                { value: "", label: "— Chọn biện pháp —" },
                ...BIEN_PHAP_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                })),
              ]}
            />
          </FormField>

          <FormField id="fsGhiChu" label="Ghi chú xử lý">
            <TextArea
              id="fsGhiChu"
              name="ghichu"
              rows={3}
              placeholder="Ví dụ: đã điều xe dự phòng ra km 22"
              value={ghiChu}
              onChange={(event) => setGhiChu(event.target.value)}
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
