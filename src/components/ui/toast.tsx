"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/icons/icon";

export type ToastData = {
  message: string;
  type: "success" | "info" | "error";
};

const TOAST_ICON: Record<ToastData["type"], string> = {
  success: "i-check-circle",
  info: "i-check-circle",
  error: "i-alert",
};

const TOAST_ICON_CLASS: Record<ToastData["type"], string> = {
  success: "text-[var(--green-600)]",
  info: "text-[var(--sky-700)]",
  error: "text-[var(--red-600)]",
};

const TOAST_CLASS =
  "fixed bottom-5 right-5 z-[90] flex max-w-[min(420px,calc(100%-32px))] items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-[13px] text-[13px] font-semibold text-[var(--slate-700)] shadow-[var(--shadow-md)] animate-[panelIn_0.28s_var(--ease)] max-[640px]:inset-x-4 max-[640px]:bottom-4 max-[640px]:max-w-none";

const DURATION_MS = 3200;

type ToastProps = {
  toast: ToastData | null;
  onDone: () => void;
};

export function Toast({ toast, onDone }: ToastProps) {
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => onDoneRef.current(), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className={TOAST_CLASS} role="status" aria-live="polite">
      <Icon
        name={TOAST_ICON[toast.type]}
        className={`icon h-5 w-5 flex-none ${TOAST_ICON_CLASS[toast.type]}`}
      />
      <span>{toast.message}</span>
    </div>
  );
}