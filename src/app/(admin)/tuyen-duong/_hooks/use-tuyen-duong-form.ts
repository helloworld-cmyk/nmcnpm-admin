"use client";

import { useEffect, useRef, useState } from "react";

import { ApiError } from "@/api/types";
import type { RouteResponse } from "@/api/tuyen-duong/api/types";
import type { TuyenDuongFormValues } from "../_data/tuyen-duong";
import {
  validateTuyenDuongForm,
  type TuyenDuongFormInvalid,
  type TuyenDuongFormState,
} from "../_utils/tuyen-duong-form";

type UseTuyenDuongFormOptions = {
  initial: TuyenDuongFormState;
  excludeId?: string;
  routes: RouteResponse[];
  onSave: (values: TuyenDuongFormValues) => Promise<void>;
};

function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Không lưu được tuyến, vui lòng thử lại.";
}

const EMPTY_INVALID: TuyenDuongFormInvalid = {
  code: false,
  origin: false,
  destination: false,
  km: false,
  min: false,
  price: false,
};

/*
 * State + kiểm tra dữ liệu cho form thêm/sửa tuyến; component
 * `TuyenDuongFormModal` chỉ còn render UI và focus theo ref trả về.
 */
export function useTuyenDuongForm({
  initial,
  excludeId,
  routes,
  onSave,
}: UseTuyenDuongFormOptions) {
  const [values, setValues] = useState<TuyenDuongFormState>(initial);
  const [invalid, setInvalid] = useState<TuyenDuongFormInvalid>(EMPTY_INVALID);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const codeRef = useRef<HTMLInputElement>(null);
  const originRef = useRef<HTMLButtonElement>(null);
  const destinationRef = useRef<HTMLButtonElement>(null);
  const kmRef = useRef<HTMLInputElement>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  const updateField = <K extends keyof TuyenDuongFormState>(
    field: K,
    value: TuyenDuongFormState[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setInvalid((prev) => ({ ...prev, [field]: false }));
    setStatus(null);
  };

  const focusFirstInvalid = (next: TuyenDuongFormInvalid) => {
    const firstRef = next.code
      ? codeRef
      : next.origin
        ? originRef
        : next.destination
          ? destinationRef
          : next.km
            ? kmRef
            : next.min
              ? minRef
              : priceRef;
    firstRef.current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateTuyenDuongForm(values, routes, excludeId);
    setInvalid(result.invalid);

    if (!result.values) {
      setStatus(result.errors[0] ?? "Dữ liệu chưa hợp lệ.");
      focusFirstInvalid(result.invalid);
      return;
    }

    setSaving(true);
    try {
      await onSave(result.values);
    } catch (error) {
      setStatus(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return {
    values,
    invalid,
    status,
    saving,
    updateField,
    handleSubmit,
    codeRef,
    originRef,
    destinationRef,
    kmRef,
    minRef,
    priceRef,
  };
}
