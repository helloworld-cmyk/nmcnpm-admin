import { IconBase, type IconProps } from "./icon-base";

export function ChartBarsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20h16" />
      <path d="M7.5 16v-4.5" />
      <path d="M12 16V6.5" />
      <path d="M16.5 16v-7" />
    </IconBase>
  );
}
