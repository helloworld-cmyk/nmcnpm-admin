"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Icon } from "@/components/icons/icon";
import {
  CONTROL_BASE,
  CONTROL_ICON_PADDING,
  CONTROL_INVALID,
  cx,
} from "./utils";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: string;
  invalid?: boolean;
  trailing?: ReactNode;
  unit?: ReactNode;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { icon, invalid, trailing, unit, className, ...props },
    ref
  ) {
    const hasTrailing = Boolean(trailing);
    const hasUnit = Boolean(unit);

    return (
      <div className="relative">
        {icon ? (
          <Icon
            name={icon}
            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--sky-600)]"
          />
        ) : null}

        <input
          ref={ref}
          className={cx(
            CONTROL_BASE,
            "px-3.5",
            icon && CONTROL_ICON_PADDING,
            (hasTrailing || hasUnit) && "pr-12",
            invalid && CONTROL_INVALID,
            className
          )}
          {...props}
        />

        {trailing ? (
          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center">
            {trailing}
          </div>
        ) : null}

        {hasUnit ? (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[var(--slate-500)]">
            {unit}
          </span>
        ) : null}
      </div>
    );
  }
);