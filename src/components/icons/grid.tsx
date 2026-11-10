import { IconBase, type IconProps } from "./icon-base";

export function GridIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="6.6" height="6.6" rx="1.8" />
      <rect x="13.4" y="4" width="6.6" height="6.6" rx="1.8" />
      <rect x="4" y="13.4" width="6.6" height="6.6" rx="1.8" />
      <rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.8" />
    </IconBase>
  );
}
