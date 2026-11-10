import { IconBase, type IconProps } from "./icon-base";

export function UserCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="10" cy="8" r="3.4" />
      <path d="M4 19.6c.6-3.2 3-5.2 6-5.2 1.5 0 2.9.5 4 1.3" />
      <path d="m14.5 17.5 2 2 4-4.5" />
    </IconBase>
  );
}
