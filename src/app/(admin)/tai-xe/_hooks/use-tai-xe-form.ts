"use client";

import { useEffect, useRef, useState } from "react";

import {
  validateTaiXeForm,
  type TaiXeFormInvalid,
  type TaiXeFormPatchValues,
  type TaiXeFormState,
  type TaiXeFormValues,
} from "../_utils/tai-xe-form";

type UseTaiXeFormOptions = {
  initial: TaiXeFormState;
  saving: boolean;
  onSave: (values: TaiXeFormValues | TaiXeFormPatchValues) => void;
};

/*
 * State + kiểm tra dữ liệu cho form tạo/sửa tài xế; component
 * `TaiXeFormModal` chỉ còn render UI và focus theo ref trả về.
 *
 * Khi `isEdit`, form so sánh với `initial` để chỉ validate và trả về
 * các field đã thay đổi → PATCH partial, không gửi thừa field.
 */
export function useTaiXeForm({
  initial,
  saving,
  onSave,
  isEdit = false,
}: UseTaiXeFormOptions & { isEdit?: boolean }) {
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
    const result = validateTaiXeForm(
      values,
      isEdit ? { mode: "edit", initial } : { mode: "add" }
    );
    setInvalid(result.invalid);

    if (!result.values) {
      setStatus(`Chưa lưu được — ${result.errors.join(" ")}`);
      focusFirstInvalid(result.invalid);
      return;
    }

    /* Khi edit: nếu không có field nào thay đổi → báo, không gửi request rỗng. */
    if (
      isEdit &&
      Object.values(result.values).every((v) => v === undefined)
    ) {
      setStatus("Chưa có thay đổi nào để lưu.");
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