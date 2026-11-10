import { IconBase, type IconProps } from "./icon-base";

export function MessageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 4.5h12A2.5 2.5 0 0 1 20.5 7v6a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 3.5 13V7A2.5 2.5 0 0 1 6 4.5Z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </IconBase>
  );
}
