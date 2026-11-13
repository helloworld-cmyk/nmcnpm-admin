"use client";

import { useEffect, useRef, useState } from "react";

import type { TaiXe, TaiXeFormValues } from "../_data/tai-xe";
import {
  validateTaiXeForm,
  type TaiXeFormInvalid,
  type TaiXeFormState,
} from "../_utils/tai-xe-form";

type UseTaiXeFormOptions = {
  initial: TaiXeFormState;
  drivers: TaiXe[];
  excludeId?: string;
  saving: boolean;
  onSave: (values: TaiXeFormValues) => void;
};

/*
 * State + kiểm tra dữ liệu cho form tạo/sửa tài xế; component
 * `TaiXeFormModal` chỉ còn render UI và focus theo ref trả về.
 */
export function useTaiXeForm({
  initial,
  drivers,
  excludeId,
  saving,
  onSave,
}: UseTaiXeFormOptions) {
  const [values, setValues] = useState<TaiXeFormState>(initial);
  const [invalid, setInvalid] = useState<TaiXeFormInvalid>({
    fullName: false,
    phone: false,
    email: false,
    licenseNumber: false,
    licenseClass: false,
    licenseExpiresOn: false,
  });
  const [status, setStatus] = useState<string | null>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const licenseNumberRef = useRef<HTMLInputElement>(null);
  const licenseClassRef = useRef<HTMLButtonElement>(null);
  const licenseExpiresOnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fullNameRef.current?.focus();
  }, []);

  const updateField = <K extends keyof TaiXeFormState>(
    field: K,
    value: TaiXeFormState[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setInvalid((prev) => ({ ...prev, [field]: false }));
    setStatus(null);
  };

  const focusFirstInvalid = (next: TaiXeFormInvalid) => {
    const firstRef = next.fullName
      ? fullNameRef
      : next.phone
        ? phoneRef
        : next.email
          ? emailRef
          : next.licenseNumber
            ? licenseNumberRef
            : next.licenseClass
              ? licenseClassRef
              : licenseExpiresOnRef;
    firstRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const result = validateTaiXeForm(values, drivers, excludeId);
    setInvalid(result.invalid);

    if (!result.values) {
      setStatus(`Chưa lưu được — ${result.errors.join(" ")}`);
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
    fullNameRef,
    phoneRef,
    emailRef,
    licenseNumberRef,
    licenseClassRef,
    licenseExpiresOnRef,
  };
}