"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  gioSangPhut,
  homNayISO,
  phutSangGio,
  type ChuyenRecord,
  type TaiXeOption,
} from "../_data/chuyen";
import {
  buildBusyMap,
  overlaps,
  type BusyInterval,
} from "../_utils/chuyen-form";

export type ChuyenFormFields = {
  tuyen: string;
  ngay: string;
  gio: string;
  xe: string;
  taixe: string;
};

export type ChuyenFormValues = {
  tuyen: string;
  ngay: string;
  gio: string;
  xe: string;
  taixe: string;
};

type UseChuyenFormOptions = {
  initial: ChuyenFormFields;
  editingId: string | null;
  trips: ChuyenRecord[];
  routeDurations?: Record<string, number>;
  taixeOptions: TaiXeOption[];
  /* Đang gọi API tạo/sửa → chặn submit lặp (kể cả Enter trong ô nhập). */
  saving?: boolean;
  onSave: (values: ChuyenFormValues, publish: boolean) => void;
};

const REQUIRED_FIELDS: {
  key: keyof ChuyenFormFields;
  label: string;
  test: (values: ChuyenFormFields) => boolean;
}[] = [
  { key: "tuyen", label: "Tuyến", test: (v) => !v.tuyen },
  { key: "ngay", label: "Ngày khởi hành", test: (v) => !v.ngay },
  { key: "gio", label: "Giờ khởi hành", test: (v) => !v.gio },
  { key: "xe", label: "Xe", test: (v) => !v.xe },
  { key: "taixe", label: "Tài xế", test: (v) => !v.taixe },
];

export function useChuyenForm({
  initial,
  editingId,
  trips,
  routeDurations,
  taixeOptions,
  saving = false,
  onSave,
}: UseChuyenFormOptions) {
  const [values, setValues] = useState<ChuyenFormFields>(initial);
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<string | null>(null);

  const tuyenRef = useRef<HTMLButtonElement>(null);
  const ngayRef = useRef<HTMLButtonElement>(null);
  const gioRef = useRef<HTMLButtonElement>(null);
  const xeRef = useRef<HTMLButtonElement>(null);
  const taixeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    tuyenRef.current?.focus();
  }, []);

  const focusField = (key: keyof ChuyenFormFields) => {
    switch (key) {
      case "tuyen":
        tuyenRef.current?.focus();
        break;
      case "ngay":
        ngayRef.current?.focus();
        break;
      case "gio":
        gioRef.current?.focus();
        break;
      case "xe":
        xeRef.current?.focus();
        break;
      case "taixe":
        taixeRef.current?.focus();
        break;
    }
  };

  const updateField = (field: keyof ChuyenFormFields, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setInvalid((prev) => ({ ...prev, [field]: false }));
    setStatus(null);
  };

  const thoiLuong = values.tuyen
    ? (routeDurations?.[values.tuyen] ?? 90)
    : 90;
  const batDau = values.gio ? gioSangPhut(values.gio) : null;
  const ketThuc = batDau !== null ? batDau + thoiLuong : null;

  const busyXe = useMemo(
    () => buildBusyMap(trips, values.ngay, editingId, "xe"),
    [trips, values.ngay, editingId]
  );
  const busyTx = useMemo(
    () => buildBusyMap(trips, values.ngay, editingId, "tx"),
    [trips, values.ngay, editingId]
  );

  const trungLich = (map: Map<string, BusyInterval[]>, key: string) =>
    key !== "" &&
    (map.get(key) ?? []).some((interval) => overlaps(interval, batDau, ketThuc));

  const clashXe = trungLich(busyXe, values.xe);
  const clashTx = trungLich(busyTx, values.taixe);

  const khiLabel =
    batDau !== null
      ? `${phutSangGio(batDau)}–${phutSangGio(ketThuc ?? batDau)} · ${thoiLuong} phút`
      : "Chọn ngày và giờ khởi hành";

  const ngayLabel = values.ngay === homNayISO() ? "hôm nay" : "ngày đã chọn";

  const availNote = (() => {
    if (batDau === null) {
      return "Chọn ngày và giờ khởi hành để xem tài nguyên còn rảnh hay không.";
    }
    if (clashXe || clashTx) {
      return `Trùng lịch ${ngayLabel}: tài nguyên đang có chuyến trong khung giờ này — chọn tài nguyên khác hoặc đổi giờ khởi hành.`;
    }
    return `Xe và tài xế đều rảnh trong khung giờ đã chọn ${ngayLabel}.`;
  })();

  const plan: BusyInterval | null =
    batDau !== null ? [batDau, ketThuc ?? batDau] : null;

  const taixeDangChon = (
    taixeOptions.find((option) => option.value === values.taixe)?.label ?? ""
  ).replace(/\s*·.*$/, "");

  const submit = (publish: boolean) => {
    /* Bỏ qua khi request trước đang chạy để không tạo trùng chuyến. */
    if (saving) return;
    const nextInvalid: Record<string, boolean> = {};
    const missing: { key: keyof ChuyenFormFields; label: string }[] = [];
    REQUIRED_FIELDS.forEach((field) => {
      if (field.test(values)) {
        nextInvalid[field.key] = true;
        missing.push({ key: field.key, label: field.label });
      }
    });
    setInvalid(nextInvalid);

    if (missing.length > 0) {
      setStatus(
        `Vui lòng điền đủ dữ liệu bắt buộc: ${missing
          .map((item) => item.label)
          .join(", ")}.`
      );
      focusField(missing[0].key);
      return;
    }

    if (clashXe || clashTx) {
      setStatus(
        "Trùng lịch: tài nguyên đang có chuyến trong khung giờ này — chọn tài nguyên khác hoặc đổi giờ khởi hành."
      );
      return;
    }

    onSave(
      {
        tuyen: values.tuyen,
        ngay: values.ngay,
        gio: values.gio,
        xe: values.xe,
        taixe: values.taixe,
      },
      publish
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(false);
  };

  const handleSaveAndPublish = () => submit(true);

  return {
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
  };
}