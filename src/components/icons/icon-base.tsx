import type { ReactNode } from "react";

export type IconProps = {
  className?: string;
};

export function IconBase({
  className = "icon",
  fill = false,
  children,
}: IconProps & {
  fill?: boolean;
  children: ReactNode;
}) {
  return (
    <svg
      className={`${fill ? "icon-sym icon-sym--fill" : "icon-sym"} ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}
