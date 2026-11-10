import { IconBase, type IconProps } from "./icon-base";

export function PercentIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19 5 5 19" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </IconBase>
  );
}
