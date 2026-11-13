"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/global-states/session-store";
import { useLogin } from "@/api/auth/tanstack/use-login";
import { getAdminAccessDenial, getMeAPI } from "@/api/auth/api/get-me";
import { ApiError } from "@/api/types";

type StatusType = "is-success" | "is-error" | "is-info";

export type LoginStatus = { message: string; type: StatusType } | null;

/* Thời gian hiển thị thông báo thành công trước khi chuyển hướng (theo design). */
const SUCCESS_REDIRECT_DELAY_MS = 700;

/* BE (LoginRequest) chỉ yêu cầu identifier không để trống; không ràng buộc định dạng email/SĐT. */
function validIdentifier(value: string) {
  return value.trim().length > 0;
}

export function useLoginForm(onAuthenticated: () => void) {
  const login = useSessionStore((s) => s.login);
  const setUser = useSessionStore((s) => s.setUser);
  const clearSession = useSessionStore((s) => s.logout);
  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const onAuthenticatedRef = useRef(onAuthenticated);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [invalid, setInvalid] = useState({
    identifier: false,
    password: false,
  });
  const [status, setStatus] = useState<LoginStatus>(null);
  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  /* Chặn double-submit trong cùng một tick trước khi React re-render. */
  const submitLockRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Đang gửi: mutation đang chạy hoặc đã đăng nhập xong, chờ chuyển hướng. */
  const isSubmitting =
    loginMutation.isPending || status?.type === "is-success";

  useEffect(() => {
    onAuthenticatedRef.current = onAuthenticated;
  }, [onAuthenticated]);

  /* Dọn hẹn giờ chuyển hướng nếu component bị hủy trước khi điều hướng. */
  useEffect(
    () => () => {
      if (redirectTimerRef.current !== null) {
        clearTimeout(redirectTimerRef.current);
      }
    },
    []
  );

  const markIdentifier = (ok: boolean) =>
    setInvalid((prev) => ({ ...prev, identifier: !ok }));
  const markPassword = (ok: boolean) =>
    setInvalid((prev) => ({ ...prev, password: !ok }));

  /* Gõ lại là xóa lỗi cũ để thông báo không còn nằm lại trên form. */
  const clearErrorStatus = () =>
    setStatus((prev) => (prev?.type === "is-error" ? null : prev));

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    clearErrorStatus();
    if (invalid.identifier && validIdentifier(value)) {
      markIdentifier(true);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearErrorStatus();
    if (invalid.password && value.trim().length > 0) {
      markPassword(true);
    }
  };

  const handleIdentifierBlur = () => {
    if (identifier.trim() || invalid.identifier) {
      markIdentifier(validIdentifier(identifier));
    }
  };

  const handlePasswordBlur = () => {
    if (password.trim() || invalid.password) {
      markPassword(Boolean(password.trim()));
    }
  };

  const toggleShowPassword = () => setShowPassword((value) => !value);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitLockRef.current) return;

    const idOk = validIdentifier(identifier);
    const pwOk = password.trim().length > 0;
    markIdentifier(idOk);
    markPassword(pwOk);

    if (!idOk || !pwOk) {
      setStatus({
        message: "Vui lòng kiểm tra lại thông tin đã nhập.",
        type: "is-error",
      });
      const firstInvalid = !idOk ? identifierRef : passwordRef;
      firstInvalid.current?.focus();
      return;
    }

    submitLockRef.current = true;
    setStatus({ message: "Đang xử lý, vui lòng chờ...", type: "is-info" });

    let succeeded = false;

    try {
      const res = await loginMutation.mutateAsync({ identifier, password });
      login(
        { name: identifier.trim() || "Quản trị viên" },
        {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          expiresIn: res.expiresIn,
        }
      );

      /*
       * Gọi /me ngay sau khi có token để kiểm tra quyền quản trị (tài khoản
       * ACTIVE + COMPANY_ADMIN của ít nhất một hãng) trước khi vào khu vực quản
       * trị. Hợp lệ thì nạp hồ sơ thật vào cache ["me"] để SessionGate không
       * gọi lại; không hợp lệ thì hủy phiên vừa tạo và báo lỗi ngay tại form.
       * Lỗi /me (network/backend) không chặn đăng nhập — SessionGate sẽ kiểm tra
       * lại và hiển thị màn "không kiểm tra được quyền".
       */
      try {
        const me = await queryClient.fetchQuery({
          queryKey: ["me"],
          queryFn: getMeAPI,
          staleTime: 30_000,
          retry: false,
        });

        const denial = getAdminAccessDenial(me);
        if (denial) {
          clearSession();
          queryClient.clear();
          setStatus({ message: denial.message, type: "is-error" });
          passwordRef.current?.focus();
          return;
        }

        setUser({
          id: me.id,
          name: me.fullName,
          email: me.email,
          phone: me.phone,
        });
      } catch {
        /* giữ hồ sơ tạm; SessionGate sẽ cập nhật lại từ /me */
      }

      succeeded = true;
      setStatus({
        message: "Thành công! Đang chuyển hướng...",
        type: "is-success",
      });
      redirectTimerRef.current = setTimeout(() => {
        redirectTimerRef.current = null;
        onAuthenticatedRef.current();
      }, SUCCESS_REDIRECT_DELAY_MS);
    } catch (error) {
      setStatus({
        message:
          error instanceof ApiError
            ? error.message
            : "Đăng nhập thất bại, vui lòng thử lại.",
        type: "is-error",
      });
      passwordRef.current?.focus();
    } finally {
      /* Giữ khóa khi đã thành công để chặn gửi lại trong lúc chờ chuyển hướng. */
      if (!succeeded) {
        submitLockRef.current = false;
      }
    }
  };

  return {
    identifier,
    setIdentifier: handleIdentifierChange,
    password,
    setPassword: handlePasswordChange,
    showPassword,
    toggleShowPassword,
    invalid,
    status,
    isSubmitting,
    identifierRef,
    passwordRef,
    handleIdentifierBlur,
    handlePasswordBlur,
    handleSubmit,
  };
}