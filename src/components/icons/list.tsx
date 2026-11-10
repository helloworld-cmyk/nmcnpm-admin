import { IconBase, type IconProps } from "./icon-base";

export function ListIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8.5 6h12M8.5 12h12M8.5 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </IconBase>
  );
}
