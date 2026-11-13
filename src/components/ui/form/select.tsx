"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icons/icon";
import { usePopoverPosition } from "@/hooks/use-popover-position";
import {
  CONTROL_BASE,
  CONTROL_ICON_PADDING,
  CONTROL_INVALID,
  PANEL_CLASS,
  cx,
} from "./utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  icon?: string;
  className?: string;
  "aria-labelledby"?: string;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      id,
      name,
      value,
      onChange,
      options,
      placeholder = "— Chọn —",
      disabled,
      invalid,
      icon,
      className,
      "aria-labelledby": ariaLabelledBy,
    },
    ref
  ) {
    const generatedId = useId();
    const baseId = id ?? `select-${generatedId}`;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const position = usePopoverPosition(open, triggerRef, 200);

    useImperativeHandle(
      ref,
      () => triggerRef.current as HTMLButtonElement,
      []
    );

    useEffect(() => setMounted(true), []);

    const selectedIndex = options.findIndex((option) => option.value === value);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

    const openList = () => {
      if (disabled) return;
      const firstEnabled = options.findIndex((option) => !option.disabled);
      setActiveIndex(
        selectedIndex >= 0 && !options[selectedIndex]?.disabled
          ? selectedIndex
          : Math.max(firstEnabled, 0)
      );
      setOpen(true);
    };

    const closeList = (restoreFocus = false) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    };

    const choose = (option: SelectOption) => {
      if (option.disabled) return;
      onChange(option.value);
      setOpen(false);
      triggerRef.current?.focus();
    };

    const moveActive = (direction: 1 | -1) => {
      if (options.length === 0) return;
      let next = activeIndex;
      for (let step = 0; step < options.length; step += 1) {
        next = (next + direction + options.length) % options.length;
        if (!options[next]?.disabled) break;
      }
      setActiveIndex(next);
    };

    useEffect(() => {
      if (!open) return;
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        if (triggerRef.current?.contains(target)) return;
        if (listRef.current?.contains(target)) return;
        setOpen(false);
      };
      document.addEventListener("pointerdown", onPointerDown);
      return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    useEffect(() => {
      if (open) {
        optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
      }
    }, [open, activeIndex]);

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!open) {
          openList();
          return;
        }
        moveActive(event.key === "ArrowDown" ? 1 : -1);
        return;
      }

      if (open && event.key === "Home") {
        event.preventDefault();
        setActiveIndex(Math.max(options.findIndex((o) => !o.disabled), 0));
        return;
      }

      if (open && event.key === "End") {
        event.preventDefault();
        for (let index = options.length - 1; index >= 0; index -= 1) {
          if (!options[index]?.disabled) {
            setActiveIndex(index);
            break;
          }
        }
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!open) {
          openList();
          return;
        }
        const option = options[activeIndex];
        if (option) choose(option);
        return;
      }

      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeList(true);
        return;
      }

      if (event.key === "Tab" && open) setOpen(false);
    };

    return (
      <div className={cx("relative min-w-0", className)}>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? `${baseId}-listbox` : undefined}
          aria-activedescendant={
            open ? `${baseId}-option-${activeIndex}` : undefined
          }
          aria-labelledby={ariaLabelledBy}
          aria-invalid={invalid || undefined}
          onClick={() => (open ? closeList() : openList())}
          onKeyDown={handleKeyDown}
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
              "truncate",
              selected ? "text-[var(--ink)]" : "font-normal text-[var(--slate-400)]"
            )}
          >
            {selected ? selected.label : placeholder}
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
                ref={listRef}
                id={`${baseId}-listbox`}
                role="listbox"
                aria-labelledby={ariaLabelledBy ?? id}
                className={PANEL_CLASS}
                style={{
                  left: position.left,
                  width: position.width,
                  top: position.top,
                  bottom: position.bottom,
                  maxHeight: position.maxHeight,
                }}
              >
                {options.length === 0 ? (
                  <p className="px-3 py-2 text-[13px] text-[var(--slate-500)]">
                    Không có lựa chọn
                  </p>
                ) : (
                  options.map((option, index) => {
                    const isSelected = option.value === value;
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={option.value || `empty-${index}`}
                        ref={(element) => {
                          optionRefs.current[index] = element;
                        }}
                        type="button"
                        id={`${baseId}-option-${index}`}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        disabled={option.disabled}
                        onMouseEnter={() => {
                          if (!option.disabled) setActiveIndex(index);
                        }}
                        onClick={() => choose(option)}
                        className={cx(
                          "flex w-full items-center justify-between gap-2 rounded-[var(--radius-xs)] px-3 py-2 text-left text-[14px] font-medium transition-colors",
                          option.disabled &&
                            "cursor-not-allowed text-[var(--slate-400)]",
                          !option.disabled &&
                            (isActive
                              ? "bg-[var(--sky-50)] text-[var(--sky-800)]"
                              : "text-[var(--ink)]"),
                          isSelected &&
                            !option.disabled &&
                            "font-bold text-[var(--sky-700)]"
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {isSelected ? (
                          <Icon
                            name="i-check"
                            className="h-4 w-4 flex-none text-[var(--sky-700)]"
                          />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>,
              document.body
            )
          : null}
      </div>
    );
  }
);