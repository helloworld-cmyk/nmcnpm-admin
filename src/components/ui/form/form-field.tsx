import type { ReactNode } from "react";
import { cx } from "./utils";

type FormFieldProps = {
  id: string;
  label: ReactNode;
  required?: boolean;
  invalid?: boolean;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
};

const LABEL_CLASS =
  "mb-1.5 ml-0.5 block text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--slate-500)]";

export function FormField({
  id,
  label,
  required,
  invalid,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div
      className={cx("flex min-w-0 flex-col", className)}
      data-invalid={invalid ? "true" : undefined}
    >
      <label
        htmlFor={id}
        className={cx(
          LABEL_CLASS,
          invalid && "text-[var(--red-600)]"
        )}
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-[var(--red-600)]">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <p className="mt-1.5 text-[12px] leading-snug text-[var(--slate-500)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}