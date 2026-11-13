"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { hasStoredToken, useSessionStore } from "@/global-states/session-store";
import { useMe } from "@/api/auth/tanstack/use-me";

export function SessionGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  const hydrate = useSessionStore((s) => s.hydrate);
  const clearSession = useSessionStore((s) => s.logout);
  const setUser = useSessionStore((s) => s.setUser);

  const { data: me } = useMe({
    enabled: Boolean(user) && hasStoredToken(),
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (!hasStoredToken()) {
      clearSession();
      router.replace("/");
    }
  }, [hydrated, user, clearSession, router]);

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

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--bg)]">
        <p className="text-sm font-semibold text-[var(--slate-500)]">
          Đang tải phiên đăng nhập...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
