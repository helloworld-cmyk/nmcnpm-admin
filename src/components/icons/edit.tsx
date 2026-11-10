import { IconBase, type IconProps } from "./icon-base";

export function EditIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.5 5.5 18 9l-8.6 8.6-4 .9.9-4L14.5 5.5Z" />
      <path d="m12.8 7.2 3.5 3.5" />
    </IconBase>
  );
}
