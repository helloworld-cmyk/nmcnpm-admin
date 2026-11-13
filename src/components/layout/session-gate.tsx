"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { hasStoredToken, useSessionStore } from "@/global-states/session-store";
import { useSessionRefresh } from "@/hooks/use-session-refresh";
import { useAdminAccess } from "@/hooks/use-admin-access";
import { AccessDenied } from "./access-denied";

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--bg)]">
      <p className="text-sm font-semibold text-[var(--slate-500)]">
        Đang tải phiên đăng nhập...
      </p>
    </div>
  );
}

export function SessionGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  const hydrate = useSessionStore((s) => s.hydrate);
  const clearSession = useSessionStore((s) => s.logout);
  const setUser = useSessionStore((s) => s.setUser);
  const { checking } = useSessionRefresh();

  const hasToken = Boolean(user) && hasStoredToken();
  const access = useAdminAccess(hydrated && hasToken && !checking);
  const me = access.me;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      // Xoá cache phiên cũ để lần đăng nhập sau không dùng lại hồ sơ người trước.
      queryClient.clear();
      router.replace("/");
      return;
    }

    if (!hasStoredToken()) {
      clearSession();
      queryClient.clear();
      router.replace("/");
    }
  }, [hydrated, user, clearSession, queryClient, router]);

  useEffect(() => {
    // Bỏ qua khi đã đăng xuất: `me` còn cache sẽ ghi đè lại phiên vừa xóa và gây vòng lặp vô hạn.
    if (!me || !user || !hasStoredToken()) return;
    if (me.id !== user.id || me.fullName !== user.name) {
      setUser({
        id: me.id,
        name: me.fullName,
        email: me.email,
        phone: me.phone,
      });
    }
  }, [me, user, setUser]);

  if (!hydrated || checking) return <LoadingScreen />;

  if (!user) return null;

  if (access.status === "loading") return <LoadingScreen />;

  if (access.status === "denied" && access.denial) {
    return (
      <AccessDenied
        title="Không có quyền truy cập"
        description={access.denial.message}
      />
    );
  }

  if (access.status === "error") {
    return (
      <AccessDenied
        title="Không kiểm tra được quyền truy cập"
        description="Không tải được thông tin phiên đăng nhập. Vui lòng kiểm tra kết nối và thử lại."
        onRetry={() => void access.retry()}
      />
    );
  }

  return <>{children}</>;
}