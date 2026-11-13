"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icons/icon";
import { usePopoverPosition } from "@/hooks/use-popover-position";
import {
  CONTROL_BASE,
  CONTROL_ICON_PADDING,
  CONTROL_INVALID,
  PANEL_SHELL,
  cx,
} from "./utils";

type TimePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  icon?: string;
  className?: string;
  clearable?: boolean;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

const HOURS = Array.from({ length: 24 }, (_, index) => pad(index));
const MINUTES = Array.from({ length: 12 }, (_, index) => pad(index * 5));

export const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(
  function TimePicker(
    {
      id,
      value,
      onChange,
      placeholder = "Chọn giờ",
      disabled,
      invalid,
      icon = "i-clock",
      className,
      clearable = true,
    },
    ref
  ) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const hourRef = useRef<HTMLButtonElement>(null);
    const minuteRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const position = usePopoverPosition(open, triggerRef, 230);
    const panelId = id ? `${id}-panel` : undefined;

    const [hour = "", minute = ""] = value ? value.split(":") : [];
    const minuteOptions =
      minute && !MINUTES.includes(minute)
        ? [...MINUTES, minute].sort()
        : MINUTES;

    useImperativeHandle(
      ref,
      () => triggerRef.current as HTMLButtonElement,
      []
    );

    useEffect(() => setMounted(true), []);

    useEffect(() => {
      if (!open) return;
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        if (triggerRef.current?.contains(target)) return;
        if (panelRef.current?.contains(target)) return;
        setOpen(false);
      };
      document.addEventListener("pointerdown", onPointerDown);
      return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    useEffect(() => {
      if (!open) return;
      hourRef.current?.scrollIntoView({ block: "nearest" });
      minuteRef.current?.scrollIntoView({ block: "nearest" });
    }, [open, hour, minute]);

    const optionClass = (active: boolean) =>
      cx(
        "flex h-8 w-full flex-none items-center justify-center rounded-lg text-[13px] font-semibold transition-colors",
        active
          ? "bg-[var(--sky-700)] text-white"
          : "text-[var(--ink)] hover:bg-[var(--sky-50)] hover:text-[var(--sky-700)]"
      );

    return (
      <div className={cx("relative min-w-0", className)}>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          disabled={disabled}
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-invalid={invalid || undefined}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              event.preventDefault();
              setOpen(false);
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          className={cx(
            CONTROL_BASE,
            "flex items-center justify-between gap-2 px-3.5 text-left",
            icon && CONTROL_ICON_PADDING,
            invalid && CONTROL_INVALID
          )}
        >
          {icon ? (
            <Icon
              name={icon}
              className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--sky-600)]"
            />
          ) : null}

          <span
            className={cx(
              "truncate tabular-nums",
              value
                ? "text-[var(--ink)]"
                : "font-normal text-[var(--slate-400)]"
            )}
          >
            {value || placeholder}
          </span>

          <Icon
            name="i-chevron-down"
            className={cx(
              "h-4 w-4 flex-none text-[var(--slate-400)] transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {mounted && open && position
          ? createPortal(
              <div
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-label="Chọn giờ"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setOpen(false);
                    triggerRef.current?.focus();
                  }
                }}
                className={cx(PANEL_SHELL, "p-3")}
                style={{
                  left: position.left,
                  width: position.width,
                  top: position.top,
                  bottom: position.bottom,
                  maxHeight: position.maxHeight,
                }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="pb-1 text-center text-[10.5px] font-bold uppercase tracking-wide text-[var(--slate-400)]">
                      Giờ
                    </span>
                    <div className="scroll-area flex max-h-[200px] flex-col gap-0.5 overflow-y-auto pr-0.5">
                      {HOURS.map((item) => (
                        <button
                          key={item}
                          ref={item === hour ? hourRef : undefined}
                          type="button"
                          onClick={() =>
                            onChange(`${item}:${minute || "00"}`)
                          }
                          className={optionClass(item === hour)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="pb-1 text-center text-[10.5px] font-bold uppercase tracking-wide text-[var(--slate-400)]">
                      Phút
                    </span>
                    <div className="scroll-area flex max-h-[200px] flex-col gap-0.5 overflow-y-auto pr-0.5">
                      {minuteOptions.map((item) => (
                        <button
                          key={item}
                          ref={item === minute ? minuteRef : undefined}
                          type="button"
                          onClick={() =>
                            onChange(`${hour || "00"}:${item}`)
                          }
                          className={optionClass(item === minute)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--border-soft)] pt-2">
                  {clearable ? (
                    <button
                      type="button"
                      onClick={() => {
                        onChange("");
                        setOpen(false);
                        triggerRef.current?.focus();
                      }}
                      className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-[var(--slate-500)] transition-colors hover:bg-[var(--bg)] hover:text-[var(--ink)]"
                    >
                      Xóa
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold text-[var(--sky-700)] transition-colors hover:bg-[var(--sky-50)]"
                  >
                    Xong
                  </button>
                </div>
              </div>,
              document.body
            )
          : null}
      </div>
    );
  }
);