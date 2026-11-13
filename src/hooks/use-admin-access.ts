"use client";

import { useMe } from "@/api/auth/tanstack/use-me";
import {
  getAdminAccessDenial,
  type AdminAccessDenial,
  type MeResponse,
} from "@/api/auth/api/get-me";

/* Trạng thái quyền truy cập khu vực quản trị của phiên hiện tại. */
export type AdminAccessStatus = "loading" | "ready" | "denied" | "error";

export type AdminAccess = {
  status: AdminAccessStatus;
  /** Hồ sơ /me đã dùng để kiểm tra quyền; null khi chưa tải xong hoặc lỗi. */
  me: MeResponse | null;
  /** Lý do bị chặn khi status = "denied". */
  denial: AdminAccessDenial | null;
  /** Gọi lại /me khi status = "error". */
  retry: () => void;
};

/**
 * Kiểm tra tài khoản đang đăng nhập có quyền vào khu vực quản trị hay không:
 * - ACTIVE và có authority COMPANY_ADMIN của ít nhất một hãng -> "ready".
 * - Thiếu quyền / tài khoản chưa kích hoạt -> "denied" kèm message hiển thị.
 * - /me lỗi (network, backend) -> "error" để UI cho thử lại.
 */
export function useAdminAccess(enabled: boolean): AdminAccess {
  const { data: me, isError, refetch } = useMe({ enabled, retry: false });

  const denial = me ? getAdminAccessDenial(me) : null;

  const status: AdminAccessStatus = isError
    ? "error"
    : !me
      ? "loading"
      : denial
        ? "denied"
        : "ready";

  return { status, me: me ?? null, denial, retry: refetch };
}