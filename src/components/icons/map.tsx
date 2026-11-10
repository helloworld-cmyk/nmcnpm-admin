import { IconBase, type IconProps } from "./icon-base";

export function MapIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 4.5-5.5 2v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2Z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </IconBase>
  );
}
