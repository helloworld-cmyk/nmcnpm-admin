import type { ComponentType } from "react";
import { AlertIcon } from "./alert";
import { ArrowRightIcon } from "./arrow-right";
import { ArrowUpRightIcon } from "./arrow-up-right";
import { BellIcon } from "./bell";
import { CalendarIcon } from "./calendar";
import { CameraIcon } from "./camera";
import { CarIcon } from "./car";
import { ChartBarsIcon } from "./chart-bars";
import { ChartIcon } from "./chart";
import { CheckCircleIcon } from "./check-circle";
import { CheckIcon } from "./check";
import { ChevronDownIcon } from "./chevron-down";
import { ChevronRightIcon } from "./chevron-right";
import { ClockIcon } from "./clock";
import { CloseIcon } from "./close";
import { CopyIcon } from "./copy";
import { DashboardIcon } from "./dashboard";
import { DownloadIcon } from "./download";
import { EditIcon } from "./edit";
import { EyeOffIcon } from "./eye-off";
import { EyeIcon } from "./eye";
import { FacebookIcon } from "./facebook";
import { FilterIcon } from "./filter";
import { GridIcon } from "./grid";
import { HeadsetIcon } from "./headset";
import { InstagramIcon } from "./instagram";
import { ListIcon } from "./list";
import { LockIcon } from "./lock";
import { LogoutIcon } from "./logout";
import { MailIcon } from "./mail";
import { MapIcon } from "./map";
import { MenuIcon } from "./menu";
import { MessageIcon } from "./message";
import { PercentIcon } from "./percent";
import { PhoneIcon } from "./phone";
import { PinIcon } from "./pin";
import { PlusIcon } from "./plus";
import { PublishIcon } from "./publish";
import { RefreshIcon } from "./refresh";
import { RouteIcon } from "./route";
import { SearchIcon } from "./search";
import { ShieldIcon } from "./shield";
import { StarIcon } from "./star";
import { SwapIcon } from "./swap";
import { TicketIcon } from "./ticket";
import { TrendingDownIcon } from "./trending-down";
import { TrendingUpIcon } from "./trending-up";
import { TrashIcon } from "./trash";
import { UserCheckIcon } from "./user-check";
import { UserIcon } from "./user";
import { UsersIcon } from "./users";
import { WalletIcon } from "./wallet";
import { XCircleIcon } from "./x-circle";
import { YoutubeIcon } from "./youtube";
import type { IconProps } from "./icon-base";

const registry = {
  "i-alert": AlertIcon,
  "i-arrow-right": ArrowRightIcon,
  "i-arrow-up-right": ArrowUpRightIcon,
  "i-bell": BellIcon,
  "i-calendar": CalendarIcon,
  "i-camera": CameraIcon,
  "i-car": CarIcon,
  "i-chart-bars": ChartBarsIcon,
  "i-chart": ChartIcon,
  "i-check-circle": CheckCircleIcon,
  "i-check": CheckIcon,
  "i-chevron-down": ChevronDownIcon,
  "i-chevron-right": ChevronRightIcon,
  "i-clock": ClockIcon,
  "i-close": CloseIcon,
  "i-copy": CopyIcon,
  "i-dashboard": DashboardIcon,
  "i-download": DownloadIcon,
  "i-edit": EditIcon,
  "i-eye-off": EyeOffIcon,
  "i-eye": EyeIcon,
  "i-facebook": FacebookIcon,
  "i-filter": FilterIcon,
  "i-grid": GridIcon,
  "i-headset": HeadsetIcon,
  "i-instagram": InstagramIcon,
  "i-list": ListIcon,
  "i-lock": LockIcon,
  "i-logout": LogoutIcon,
  "i-mail": MailIcon,
  "i-map": MapIcon,
  "i-menu": MenuIcon,
  "i-message": MessageIcon,
  "i-percent": PercentIcon,
  "i-phone": PhoneIcon,
  "i-pin": PinIcon,
  "i-plus": PlusIcon,
  "i-publish": PublishIcon,
  "i-refresh": RefreshIcon,
  "i-route": RouteIcon,
  "i-search": SearchIcon,
  "i-shield": ShieldIcon,
  "i-star": StarIcon,
  "i-swap": SwapIcon,
  "i-ticket": TicketIcon,
  "i-trending-down": TrendingDownIcon,
  "i-trending-up": TrendingUpIcon,
  "i-trash": TrashIcon,
  "i-user-check": UserCheckIcon,
  "i-user": UserIcon,
  "i-users": UsersIcon,
  "i-wallet": WalletIcon,
  "i-x-circle": XCircleIcon,
  "i-youtube": YoutubeIcon,
} as const;

export type IconName = keyof typeof registry;

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Component: ComponentType<IconProps> | undefined =
    registry[name as IconName];
  if (!Component) return null;
  return <Component className={className} />;
}
