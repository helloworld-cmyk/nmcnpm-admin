"use client";

import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/global-states/session-store";
import { useLogin } from "@/api/auth/tanstack/use-login";
import { ApiError } from "@/api/types";

type StatusType = "is-success" | "is-error" | "is-info";

export type LoginStatus = { message: string; type: StatusType } | null;

/* BE (LoginRequest) chỉ yêu cầu identifier không để trống; không ràng buộc định dạng email/SĐT. */
function validIdentifier(value: string) {
  return value.trim().length > 0;
}

export function useLoginForm(onAuthenticated: () => void) {
  const login = useSessionStore((s) => s.login);
  const loginMutation = useLogin();
  const onAuthenticatedRef = useRef(onAuthenticated);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [invalid, setInvalid] = useState({
    identifier: false,
    password: false,
  });
  const [status, setStatus] = useState<LoginStatus>(null);
  const [loading, setLoading] = useState(false);
  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onAuthenticatedRef.current = onAuthenticated;
  }, [onAuthenticated]);

  const markIdentifier = (ok: boolean) =>
    setInvalid((prev) => ({ ...prev, identifier: !ok }));
  const markPassword = (ok: boolean) =>
    setInvalid((prev) => ({ ...prev, password: !ok }));

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
    if (loading) return;

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

    setLoading(true);
    setStatus({ message: "Đang xử lý, vui lòng chờ...", type: "is-info" });

    try {
      const res = await loginMutation.mutateAsync({ identifier, password });
      login(
        { name: identifier.trim() || "Quản trị viên" },
        { accessToken: res.accessToken, refreshToken: res.refreshToken }
      );
      setStatus({
        message: "Thành công! Đang chuyển hướng...",
        type: "is-success",
      });
      onAuthenticatedRef.current();
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
      setLoading(false);
    }
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    invalid,
    status,
    loading,
    identifierRef,
    passwordRef,
    handleIdentifierBlur,
    handlePasswordBlur,
    handleSubmit,
  };
}
