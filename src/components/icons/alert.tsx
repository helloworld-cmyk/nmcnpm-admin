import { IconBase, type IconProps } from "./icon-base";

export function AlertIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4 21 19.5H3L12 4Z" />
      <path d="M12 10v4.2M12 16.8h.01" />
    </IconBase>
  );
}
