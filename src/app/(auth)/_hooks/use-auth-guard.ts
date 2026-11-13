"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasStoredToken, useSessionStore } from "@/global-states/session-store";

/** Điểm đến khi phiên đăng nhập còn hiệu lực. */
export const AUTH_REDIRECT_PATH = "/tong-quan";

/**
 * Chặn truy cập trang đăng nhập khi đã có phiên: đọc phiên từ storage (hydrate)
 * rồi điều hướng sang khu vực quản trị. Trả `hydrated` để UI chờ trước khi
 * render form login, tránh nháy form cho người đã đăng nhập.
 */
export function useAuthGuard() {
  const router = useRouter();
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  const hydrate = useSessionStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (user && hasStoredToken()) {
      router.replace(AUTH_REDIRECT_PATH);
    }
  }, [hydrated, user, router]);

  return { hydrated };
}