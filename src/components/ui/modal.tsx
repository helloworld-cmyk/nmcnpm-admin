"use client";

import { type ReactNode } from "react";
import { Icon } from "@/components/icons/icon";
import { useModalBehavior } from "@/hooks/use-modal-behavior";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "w-[min(460px,100%)]",
  md: "w-[min(600px,100%)]",
  lg: "w-[min(680px,100%)]",
};

const CLOSE_CLASS =
  "grid h-10 w-10 flex-none place-items-center rounded-[var(--radius-xs)] text-[var(--slate-500)] transition-colors hover:bg-[var(--sky-50)] hover:text-[var(--sky-700)]";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useModalBehavior(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-5 max-[520px]:p-3">
      <button
        type="button"
        aria-label="Đóng hộp thoại"
        onClick={onClose}
        className="absolute inset-0 cursor-default border-0 bg-[rgba(8,20,38,0.55)]"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[min(720px,100%)] animate-[panelIn_0.28s_var(--ease)] flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface)] shadow-[var(--shadow-lg)] ${SIZE_CLASS[size]}`}
      >
        {title !== undefined && (
          <div className="flex flex-none items-start justify-between gap-3.5 px-[22px] pb-3.5 pt-5">
            <div className="[font-family:var(--font-heading)] text-[18.5px] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--ink)]">
              {title}
            </div>
            <button type="button" aria-label="Đóng" onClick={onClose} className={CLOSE_CLASS}>
              <Icon name="i-close" className="icon" />
            </button>
          </div>
        )}

        <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-[22px] pb-5 pt-1.5">
          <div className="grid gap-3.5">{children}</div>
        </div>

        {footer !== undefined && (
          <div className="flex flex-none flex-wrap justify-end gap-2.5 border-t border-[var(--border-soft)] px-[22px] pb-5 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
