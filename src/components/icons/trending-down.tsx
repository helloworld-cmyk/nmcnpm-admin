import { IconBase, type IconProps } from "./icon-base";

export function TrendingDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 8 9.5 14 13.5 10 20.5 17" />
      <path d="M15.5 17h5v-5" />
    </IconBase>
  );
}
