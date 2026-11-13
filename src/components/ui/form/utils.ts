export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const CONTROL_BASE =
  "h-12 w-full rounded-xl border border-[var(--border)] bg-[#fafcfe] text-base font-medium text-[var(--ink)] transition-[border-color,box-shadow,background-color] placeholder:font-normal placeholder:text-[var(--slate-400)] hover:border-[var(--slate-300)] focus:border-[var(--sky-500)] focus:bg-white focus:outline-none focus-visible:outline-none! focus:ring-4 focus:ring-[rgba(14,165,233,0.13)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--border)]";

export const CONTROL_INVALID =
  "border-[#fca5a5]! bg-[#fff8f8]! focus:border-[#fca5a5]! focus:ring-[rgba(220,38,38,0.12)]!";

export const CONTROL_ICON_PADDING = "pl-11";

export const PANEL_SHELL =
  "scroll-area fixed z-[120] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] animate-[panelIn_0.18s_var(--ease)]";

export const PANEL_CLASS = `${PANEL_SHELL} p-1.5`;