"use client";

import { Icon } from "@/components/icons/icon";
import { useAdminLogout } from "@/hooks/use-admin-logout";

type AccessDeniedProps = {
  title: string;
  description: string;
  /** Hiện nút thử lại khi lỗi tải /me (network/backend). */
  onRetry?: () => void;
};

/* Màn thông báo khi phiên hợp lệ nhưng không có quyền vào khu vực quản trị. */
export function AccessDenied({ title, description, onRetry }: AccessDeniedProps) {
  const { logout, isPending } = useAdminLogout();

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-10">
      <section className="w-full max-w-[460px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-7 text-center shadow-[var(--shadow-md)]">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--red-50)] text-[var(--red-600)]">
          <Icon name="i-lock" className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-[22px] font-extrabold tracking-[-0.02em]">
          {title}
        </h1>
        <p className="mt-2 text-[14px] leading-[1.65] text-[var(--slate-600)]">
          {description}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="button"
            onClick={logout}
            disabled={isPending}
            className="btn btn-primary btn-lg flex-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="i-logout" className="icon" />
            Đăng xuất
          </button>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="btn btn-ghost btn-lg flex-1"
            >
              <Icon name="i-refresh" className="icon" />
              Thử lại
            </button>
          )}
        </div>
      </section>
    </div>
  );
}