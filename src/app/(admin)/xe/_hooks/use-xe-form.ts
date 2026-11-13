"use client";

import { useEffect, useRef, useState } from "react";

import type { Xe, XeFormValues } from "../_data/vehicles";
import {
  validateXeForm,
  type XeFormInvalid,
  type XeFormState,
} from "../_utils/xe-form";

type UseXeFormOptions = {
  initial: XeFormState;
  vehicles: Xe[];
  excludeId?: string;
  onSave: (values: XeFormValues) => void;
};

/*
 * State + kiểm tra dữ liệu cho form thêm/sửa xe; component `XeFormModal` chỉ
 * còn render UI và focus theo ref trả về.
 */
export function useXeForm({
  initial,
  vehicles,
  excludeId,
  onSave,
}: UseXeFormOptions) {
  const [values, setValues] = useState<XeFormState>(initial);
  const [invalid, setInvalid] = useState<XeFormInvalid>({
    bienSo: false,
    loaiXe: false,
    soCho: false,
  });
  const [status, setStatus] = useState<string | null>(null);
  const bienSoRef = useRef<HTMLInputElement>(null);
  const loaiXeRef = useRef<HTMLInputElement>(null);
  const soChoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bienSoRef.current?.focus();
  }, []);

  const updateField = <K extends keyof XeFormState>(
    field: K,
    value: XeFormState[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (field === "bienSo" || field === "loaiXe" || field === "soCho") {
      setInvalid((prev) => ({ ...prev, [field]: false }));
      setStatus(null);
    }
  };

  const focusFirstInvalid = (next: XeFormInvalid) => {
    const firstRef = next.bienSo
      ? bienSoRef
      : next.loaiXe
        ? loaiXeRef
        : soChoRef;
    firstRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateXeForm(values, vehicles, excludeId);
    setInvalid(result.invalid);

    if (!result.values) {
      setStatus(result.errors.join(" "));
      focusFirstInvalid(result.invalid);
      return;
    }

    onSave(result.values);
  };

  return {
    values,
    invalid,
    status,
    updateField,
    handleSubmit,
    bienSoRef,
    loaiXeRef,
    soChoRef,
  };
}