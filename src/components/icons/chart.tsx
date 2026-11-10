import { IconBase, type IconProps } from "./icon-base";

export function ChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20h16" />
      <path d="M7 20v-6.5M12 20V6.5M17 20v-9.5" />
    </IconBase>
  );
}
