"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  gioSangPhut,
  homNayISO,
  phutSangGio,
  type ChuyenRecord,
  type TaiXeOption,
  type XeOption,
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
  ghe: string;
  gia: string;
  cong: string;
  ghichu: string;
};

export type ChuyenFormValues = {
  tuyen: string;
  ngay: string;
  gio: string;
  xe: string;
  taixe: string;
  ghe: number;
  gia: number;
  cong: number | null;
  ghichu: string;
};

type UseChuyenFormOptions = {
  initial: ChuyenFormFields;
  editingMa: string | null;
  trips: ChuyenRecord[];
  routeDurations?: Record<string, number>;
  xeOptions: XeOption[];
  taixeOptions: TaiXeOption[];
  onSave: (values: ChuyenFormValues) => void;
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
  { key: "ghe", label: "Số ghế mở bán", test: (v) => !v.ghe },
  { key: "gia", label: "Giá vé mỗi ghế", test: (v) => !v.gia },
];

export function useChuyenForm({
  initial,
  editingMa,
  trips,
  routeDurations,
  xeOptions,
  taixeOptions,
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
  const gheRef = useRef<HTMLInputElement>(null);
  const giaRef = useRef<HTMLInputElement>(null);

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
      case "ghe":
        gheRef.current?.focus();
        break;
      case "gia":
        giaRef.current?.focus();
        break;
    }
  };

  const updateField = (field: keyof ChuyenFormFields, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setInvalid((prev) => ({ ...prev, [field]: false }));
    setStatus(null);
  };

  const sucChua = values.xe
    ? (xeOptions.find((option) => option.value === values.xe)?.capacity ?? null)
    : null;
  const thoiLuong = values.tuyen
    ? (routeDurations?.[values.tuyen] ?? 90)
    : 90;
  const batDau = values.gio ? gioSangPhut(values.gio) : null;
  const ketThuc = batDau !== null ? batDau + thoiLuong : null;

  const busyXe = useMemo(
    () => buildBusyMap(trips, values.ngay, editingMa, "xe"),
    [trips, values.ngay, editingMa]
  );
  const busyTx = useMemo(
    () => buildBusyMap(trips, values.ngay, editingMa, "tx"),
    [trips, values.ngay, editingMa]
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextInvalid: Record<string, boolean> = {};
    const missing: { key: keyof ChuyenFormFields; label: string }[] = [];
    REQUIRED_FIELDS.forEach((field) => {
      if (field.test(values)) {
        nextInvalid[field.key] = true;
        missing.push({ key: field.key, label: field.label });
      }
    });
    setInvalid(nextInvalid);

    const soGhe = Number(values.ghe);
    const gia = Number(values.gia);

    if (missing.length > 0) {
      setStatus(
        `Vui lòng điền đủ dữ liệu bắt buộc: ${missing
          .map((item) => item.label)
          .join(", ")}.`
      );
      focusField(missing[0].key);
      return;
    }

    if (sucChua !== null && soGhe > sucChua) {
      setStatus(`Số ghế mở bán vượt sức chứa xe (tối đa ${sucChua} ghế).`);
      gheRef.current?.focus();
      return;
    }

    if (clashXe || clashTx) {
      setStatus(
        "Trùng lịch: tài nguyên đang có chuyến trong khung giờ này — chọn tài nguyên khác hoặc đổi giờ khởi hành."
      );
      return;
    }

    onSave({
      tuyen: values.tuyen,
      ngay: values.ngay,
      gio: values.gio,
      xe: values.xe,
      taixe: values.taixe,
      ghe: soGhe,
      gia,
      cong: values.cong ? Number(values.cong) : null,
      ghichu: values.ghichu.trim(),
    });
  };

  return {
    values,
    invalid,
    status,
    updateField,
    handleSubmit,
    tuyenRef,
    ngayRef,
    gioRef,
    xeRef,
    taixeRef,
    gheRef,
    giaRef,
    sucChua,
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