import { IconBase, type IconProps } from "./icon-base";

export function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 9.5a6 6 0 1 0-12 0c0 3.8-1.3 5.3-2.2 6.2h16.4C19.3 14.8 18 13.3 18 9.5Z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </IconBase>
  );
}
