"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { refreshAccessTokenAPI } from "@/api/auth/api/refresh";
import { hasStoredToken, useSessionStore } from "@/global-states/session-store";

/* Làm mới trước khi access token hết hạn để phiên không bị gián đoạn. */
const REFRESH_LEAD_MS = 60_000;

/**
 * Làm mới token chủ động theo `expiresIn` của phiên:
 * - Khi mới vào khu vực quản trị: nếu token đã hết hạn (hoặc không biết thời
 *   điểm hết hạn) thì gọi /auth/refresh ngay — thành công thì vào tiếp, thất
 *   bại thì đăng xuất và quay về trang đăng nhập.
 * - Khi phiên còn hạn: hẹn giờ làm mới trước `REFRESH_LEAD_MS` để token luôn
 *   còn hiệu lực trong lúc dùng (làm mới ngầm, không chặn giao diện).
 */
export function useSessionRefresh() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  const expiresAt = useSessionStore((s) => s.expiresAt);
  const logout = useSessionStore((s) => s.logout);

  const [checking, setChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /* Phiên không thể tiếp tục: xóa phiên, cache và quay về trang đăng nhập. */
  const endSession = useCallback(() => {
    clearTimer();
    logout();
    queryClient.clear();
    router.replace("/");
  }, [clearTimer, logout, queryClient, router]);

  const refreshSession = useCallback(
    async (blocking: boolean) => {
      clearTimer();
      if (blocking) setChecking(true);
      try {
        await refreshAccessTokenAPI();
      } catch {
        endSession();
      } finally {
        if (blocking) setChecking(false);
      }
    },
    [clearTimer, endSession]
  );

  useEffect(() => {
    if (!hydrated || !user || !hasStoredToken()) {
      clearTimer();
      return;
    }

    /*
     * Không có mốc hết hạn (backend không trả `expiresIn`) hoặc token đã/ sắp
     * hết hạn -> làm mới ngay và chặn giao diện; còn lại thì hẹn giờ làm mới
     * ngầm trước khi token hết hạn.
     */
    const needsRefresh =
      expiresAt === null || expiresAt - Date.now() <= REFRESH_LEAD_MS;
    const delay = needsRefresh ? 0 : expiresAt - Date.now() - REFRESH_LEAD_MS;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void refreshSession(needsRefresh);
    }, delay);

    return clearTimer;
  }, [hydrated, user, expiresAt, clearTimer, refreshSession]);

  return { checking };
}