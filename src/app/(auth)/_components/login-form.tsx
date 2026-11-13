"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons/icon";
import { FormField, TextInput } from "@/components/ui/form";
import { useLoginForm } from "../_hooks/use-login-form";

const REDIRECT_PATH = "/tong-quan";

const TOGGLE_CLASS =
  "grid h-9 w-9 place-items-center rounded-lg text-[var(--slate-500)] transition-colors hover:bg-[var(--sky-50)] hover:text-[var(--sky-700)]";

export function LoginForm() {
  const router = useRouter();
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
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
  } = useLoginForm(() => router.replace(REDIRECT_PATH));

  return (
    <form className="auth-form" noValidate onSubmit={handleSubmit}>
      <FormField
        id="identifier"
        label="Số điện thoại hoặc email"
        invalid={invalid.identifier}
      >
        <TextInput
          ref={identifierRef}
          type="text"
          id="identifier"
          name="identifier"
          icon="i-mail"
          placeholder="VD: 0912 345 678"
          autoComplete="username"
          aria-invalid={invalid.identifier}
          invalid={invalid.identifier}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onBlur={handleIdentifierBlur}
          required
        />
      </FormField>

      <FormField id="password" label="Mật khẩu" invalid={invalid.password}>
        <TextInput
          ref={passwordRef}
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          icon="i-shield"
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          aria-invalid={invalid.password}
          invalid={invalid.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={handlePasswordBlur}
          required
          trailing={
            <button
              type="button"
              className={TOGGLE_CLASS}
              aria-controls="password"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={toggleShowPassword}
            >
              <Icon
                name={showPassword ? "i-eye-off" : "i-eye"}
                className="h-[18px] w-[18px]"
              />
            </button>
          }
        />
      </FormField>

      <button
        type="submit"
        className={`btn btn-primary btn-lg auth-submit${isSubmitting ? " is-loading" : ""} disabled:cursor-not-allowed disabled:opacity-70`}
        disabled={isSubmitting}
      >
        Đăng nhập
      </button>
      <div
        className={`form-status${status ? ` ${status.type}` : ""}`}
        id="formStatus"
        role="status"
        aria-live="polite"
      >
        {status?.message}
      </div>
    </form>
  );
}