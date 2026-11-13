"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { FormField, Select, TextArea } from "@/components/ui/form";
import {
  BIEN_PHAP_OPTIONS,
  type ChuyenRecord,
} from "../_data/chuyen";

type ChuyenSucoKetQuaModalProps = {
  trip: ChuyenRecord | null;
  onClose: () => void;
  onConfirm: (
    tripId: string,
    data: { bienPhapThuc: string; ketQua: string }
  ) => void;
};

export function ChuyenSucoKetQuaModal({
  trip,
  onClose,
  onConfirm,
}: ChuyenSucoKetQuaModalProps) {
  const [bienPhapThuc, setBienPhapThuc] = useState("");
  const [ketQua, setKetQua] = useState("");
  const [invalid, setInvalid] = useState({ bienPhapThuc: false, ketQua: false });
  const [error, setError] = useState<string | null>(null);
  const bienPhapRef = useRef<HTMLButtonElement>(null);
  const ketQuaRef = useRef<HTMLTextAreaElement>(null);

  const handleConfirm = () => {
    if (!trip) return;
    if (!bienPhapThuc || !ketQua.trim()) {
      setInvalid({ bienPhapThuc: !bienPhapThuc, ketQua: !ketQua.trim() });
      setError("Chọn biện pháp thực tế và ghi kết quả xử lý.");
      (bienPhapThuc ? ketQuaRef : bienPhapRef).current?.focus();
      return;
    }
    onConfirm(trip.id, { bienPhapThuc, ketQua: ketQua.trim() });
  };

  return (
    <Modal
      open={trip !== null}
      onClose={onClose}
      size="sm"
      title={
        <span className="block">
          <span className="block text-[18px] leading-[1.25]">
            Ghi nhận kết quả
          </span>
          <span className="mt-1 block text-[12.5px] font-medium leading-snug tracking-normal text-[var(--slate-500)]">
            Đóng sự cố của chuyến <strong className="font-bold">{trip?.ma}</strong>{" "}
            sau khi đã xử lý xong.
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
            Ghi nhận và đóng sự cố
          </button>
        </>
      }
    >
      {trip && (
        <>
          <FormField
            id="fkBienPhap"
            label="Biện pháp thực tế"
            required
            invalid={invalid.bienPhapThuc}
          >
            <Select
              ref={bienPhapRef}
              id="fkBienPhap"
              name="bienphap"
              icon="i-list"
              value={bienPhapThuc}
              aria-invalid={invalid.bienPhapThuc}
              invalid={invalid.bienPhapThuc}
              placeholder="— Chọn biện pháp đã thực hiện —"
              onChange={(value) => {
                setBienPhapThuc(value);
                setInvalid((prev) => ({ ...prev, bienPhapThuc: false }));
                setError(null);
              }}
              options={[
                { value: "", label: "— Chọn biện pháp đã thực hiện —" },
                ...BIEN_PHAP_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label,
                })),
              ]}
            />
          </FormField>

          <FormField
            id="fkKetQua"
            label="Kết quả xử lý"
            required
            invalid={invalid.ketQua}
          >
            <TextArea
              ref={ketQuaRef}
              id="fkKetQua"
              name="ketqua"
              rows={3}
              placeholder="Ví dụ: khách lên xe thay lúc 08:40, không ảnh hưởng vé"
              value={ketQua}
              aria-invalid={invalid.ketQua}
              invalid={invalid.ketQua}
              onChange={(event) => {
                setKetQua(event.target.value);
                setInvalid((prev) => ({ ...prev, ketQua: false }));
                setError(null);
              }}
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
