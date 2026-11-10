import { IconBase, type IconProps } from "./icon-base";

export function TicketIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 8.2A2.7 2.7 0 0 1 7.2 5.5h9.6a2.7 2.7 0 0 1 2.7 2.7v1.6a1.9 1.9 0 0 0 0 3.8v1.7a2.7 2.7 0 0 1-2.7 2.7H7.2a2.7 2.7 0 0 1-2.7-2.7v-1.7a1.9 1.9 0 0 0 0-3.8V8.2Z" />
      <path d="M14.6 6.6v10.8" strokeDasharray="2 3" />
    </IconBase>
  );
}
