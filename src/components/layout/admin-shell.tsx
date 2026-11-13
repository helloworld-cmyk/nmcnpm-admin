"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons/icon";
import { useSessionStore } from "@/global-states/session-store";
import { useAdminLogout } from "@/hooks/use-admin-logout";

const NAV_ITEMS = [
  { href: "/tong-quan", label: "Tổng quan", icon: "i-grid" },
  { href: "/chuyen", label: "Quản lý chuyến", icon: "i-route" },
  { href: "/don-dat", label: "Quản lý đơn đặt", icon: "i-ticket" },
  { href: "/tai-xe", label: "Quản lý tài xế", icon: "i-user" },
  { href: "/xe", label: "Quản lý xe", icon: "i-car" },
  { href: "/tuyen-duong", label: "Quản lý tuyến", icon: "i-pin" },
  { href: "/khach-hang", label: "Quản lý khách hàng", icon: "i-users" },
  { href: "/doanh-thu", label: "Doanh thu", icon: "i-wallet" },
] as const;

const AVATAR_CLASS =
  "grid h-[38px] w-[38px] flex-none place-items-center rounded-full bg-[var(--sky-500)] [font-family:var(--font-heading)] text-sm font-extrabold uppercase leading-none text-[var(--navy-950)]";

const NAV_ITEM_CLASS =
  "relative flex min-h-[46px] items-center gap-[11px] rounded-[11px] px-[13px] text-[14.5px] font-semibold transition-colors hover:bg-[var(--navy-800)] hover:text-white";

const NAV_ITEM_ACTIVE_CLASS =
  "bg-[var(--navy-700)] text-white before:absolute before:inset-y-[11px] before:left-0 before:w-[3px] before:rounded-[3px] before:bg-[var(--sky-500)] before:content-['']";

const TOP_ICON_BUTTON_CLASS =
  "inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--slate-600)] transition-colors hover:border-[var(--sky-300)] hover:bg-[var(--sky-50)] hover:text-[var(--sky-700)]";

const SIDE_OPEN_CLASS =
  "max-[1024px]:translate-x-0 max-[1024px]:shadow-[var(--shadow-lg)]";

const SIDE_CLOSED_CLASS = "max-[1024px]:-translate-x-[104%]";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useSessionStore((s) => s.user);
  const { logout: handleLogout, isPending: loggingOut } = useAdminLogout();
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSideOpen(false);
    };
    const media = window.matchMedia("(max-width: 1024px)");
    const onMediaChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setSideOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onMediaChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onMediaChange);
    };
  }, []);

  const userName = user?.name?.trim() || "Quản trị viên";
  const initial = (user?.name ?? "").trim().charAt(0).toUpperCase() || "A";

  /** Điều hướng trong sidebar (mobile) xong phải đóng drawer để thấy trang mới. */
  const closeSide = () => setSideOpen(false);

  return (
    <div className="flex min-h-screen">
      {sideOpen && (
        <button
          type="button"
          aria-label="Đóng menu quản trị"
          onClick={closeSide}
          className="fixed inset-0 z-[55] cursor-default border-0 bg-[rgba(8,20,38,0.56)]"
        />
      )}

      <aside
        id="adm-side"
        aria-label="Điều hướng quản trị"
        className={`sticky top-0 z-[60] flex h-screen w-[264px] flex-none flex-col bg-[var(--navy-900)] transition-transform duration-300 ease-[var(--ease)] max-[1024px]:fixed max-[1024px]:inset-y-0 max-[1024px]:left-0 max-[1024px]:h-full ${
          sideOpen ? SIDE_OPEN_CLASS : SIDE_CLOSED_CLASS
        }`}
      >
        <div className="pt-[18px]">
          <Link
            href="/tong-quan"
            aria-label="Vi Vu Việt — Tổng quan"
            onClick={closeSide}
            className="flex min-h-[44px] items-center gap-[11px] px-3.5"
          >
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-white">
              <Image src="/assets/logo.svg" alt="" width={30} height={30} unoptimized />
            </span>
            <span className="[font-family:var(--font-heading)] text-[17.5px] font-extrabold tracking-[-0.02em] text-white">
              Vi Vu <span className="text-[var(--sky-300)]">Việt</span>
            </span>
          </Link>
          <p className="mx-3.5 mb-3.5 mt-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--slate-400)]">
            Quản trị hệ thống
          </p>
        </div>

        <nav
          aria-label="Mục quản trị"
          className="scroll-area scroll-area--dark flex flex-col gap-[3px] overflow-y-auto px-3"
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={closeSide}
                className={`${NAV_ITEM_CLASS}${active ? ` ${NAV_ITEM_ACTIVE_CLASS}` : ""}`}
              >
                <Icon
                  name={item.icon}
                  className={`icon h-[19px] w-[19px] ${
                    active ? "text-[var(--sky-300)]" : "text-[var(--slate-400)]"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--navy-700)] px-3 pb-4 pt-3.5">
          <div className="flex items-center gap-[11px] px-0.5 pb-3 pt-1">
            <span className={AVATAR_CLASS} aria-hidden="true">
              {initial}
            </span>
            <span className="flex min-w-0 flex-col">
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold text-white">
                {userName}
              </strong>
              <span className="text-xs text-[var(--slate-400)]">Quản trị viên</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex min-h-[44px] w-full items-center justify-center gap-[9px] rounded-[11px] border border-[var(--navy-700)] text-[13.5px] font-bold text-[var(--slate-300)] transition-colors hover:border-[var(--sky-300)] hover:bg-[var(--navy-800)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="i-logout" className="icon h-[17px] w-[17px]" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-[var(--header-h)] items-center gap-[13px] border-b border-[var(--border-soft)] bg-[rgba(255,255,255,0.85)] px-[clamp(16px,3vw,30px)] backdrop-blur-[14px] max-[768px]:h-[70px]">
          <button
            type="button"
            aria-expanded={sideOpen}
            aria-controls="adm-side"
            aria-label={sideOpen ? "Đóng menu quản trị" : "Mở menu quản trị"}
            onClick={() => setSideOpen((v) => !v)}
            className={`${TOP_ICON_BUTTON_CLASS} hidden max-[1024px]:inline-flex`}
          >
            {sideOpen ? (
              <Icon name="i-close" className="icon" />
            ) : (
              <Icon name="i-menu" className="icon" />
            )}
          </button>

          <Link
            href="/tong-quan"
            aria-label="Vi Vu Việt — Tổng quan"
            className="hidden items-center gap-[9px] max-[1024px]:inline-flex"
          >
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-white shadow-[var(--shadow-xs)]">
              <Image src="/assets/logo.svg" alt="" width={26} height={26} unoptimized />
            </span>
            <span className="[font-family:var(--font-heading)] text-[15.5px] font-extrabold tracking-[-0.02em] text-[var(--ink)]">
              Vi Vu <span className="text-[var(--sky-600)]">Việt</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2.5">
            <button type="button" aria-label="Thông báo — 3 mục mới" className={`${TOP_ICON_BUTTON_CLASS} relative`}>
              <Icon name="i-bell" className="icon" />
              <span
                aria-hidden="true"
                className="absolute right-[11px] top-[10px] h-2 w-2 rounded-full bg-[var(--red-600)] shadow-[0_0_0_2px_var(--surface)]"
              />
            </button>

            <div className="flex items-center gap-2.5">
              <span className={AVATAR_CLASS} aria-hidden="true">
                {initial}
              </span>
              <span className="flex min-w-0 flex-col max-[520px]:hidden">
                <strong className="text-[13.5px] font-bold leading-[1.25] text-[var(--ink)]">
                  {userName}
                </strong>
                <span className="text-[11.5px] leading-[1.3] text-[var(--slate-500)]">
                  Quản trị viên
                </span>
              </span>
            </div>

            <button
              type="button"
              aria-label="Đăng xuất"
              onClick={handleLogout}
              disabled={loggingOut}
              className="grid h-11 w-11 flex-none place-items-center rounded-[10px] text-[var(--slate-500)] transition-colors hover:bg-[var(--red-50)] hover:text-[var(--red-600)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="i-logout" className="icon" />
            </button>
          </div>
        </header>

        <main id="main" className="flex-1 pb-[clamp(32px,4vw,48px)] pt-[clamp(20px,3vw,30px)]">
          <div className="container">{children}</div>
        </main>
      </div>
    </div>
  );
}
