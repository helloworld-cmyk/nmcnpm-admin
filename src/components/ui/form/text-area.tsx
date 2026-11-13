"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { CONTROL_BASE, CONTROL_INVALID, cx } from "./utils";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ invalid, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cx(
          CONTROL_BASE,
          "min-h-[84px] resize-y px-3.5 py-3 leading-relaxed",
          invalid && CONTROL_INVALID,
          className
        )}
        {...props}
      />
    );
  }
);