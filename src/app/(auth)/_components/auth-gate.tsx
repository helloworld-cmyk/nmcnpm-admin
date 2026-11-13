"use client";

import type { ReactNode } from "react";
import { useAuthGuard } from "../_hooks/use-auth-guard";

const LOADING_CLASS =
  "grid min-h-screen place-items-center bg-[var(--bg)] text-sm font-semibold text-[var(--slate-500)]";

/** Chỉ render children (form đăng nhập) khi chưa có phiên đăng nhập hợp lệ. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { hydrated } = useAuthGuard();

  if (!hydrated) {
    return <div className={LOADING_CLASS}>Đang tải phiên đăng nhập...</div>;
  }

  return <>{children}</>;
}