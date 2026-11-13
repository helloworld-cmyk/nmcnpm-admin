"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useLogout } from "@/api/auth/tanstack/use-logout";
import { useSessionStore } from "@/global-states/session-store";

/* Đăng xuất: thu hồi token ở backend, xóa cache hồ sơ và phiên local, về trang đăng nhập. */
export function useAdminLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useSessionStore((s) => s.logout);
  const { mutate, isPending } = useLogout();

  const logout = useCallback(() => {
    if (isPending) return;

    mutate(undefined, {
      onSettled: () => {
        queryClient.removeQueries({ queryKey: ["me"] });
        clearSession();
        router.replace("/");
      },
    });
  }, [isPending, mutate, queryClient, clearSession, router]);

  return { logout, isPending };
}