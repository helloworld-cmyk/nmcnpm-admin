"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons/icon";
import { useLoginForm } from "../_hooks/use-login-form";

const REDIRECT_PATH = "/tong-quan";

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
    loading,
    identifierRef,
    passwordRef,
    handleIdentifierBlur,
    handlePasswordBlur,
    handleSubmit,
  } = useLoginForm(() => router.push(REDIRECT_PATH));

  return (
    <form className="auth-form" noValidate onSubmit={handleSubmit}>
      <div className={`field${invalid.identifier ? " is-invalid" : ""}`}>
        <label htmlFor="identifier">Số điện thoại hoặc email</label>
        <div className="field-control">
          <Icon name="i-mail" className="icon field-icon" />
          <input
            ref={identifierRef}
            type="text"
            id="identifier"
            name="identifier"
            placeholder="VD: 0912 345 678"
            autoComplete="username"
            aria-invalid={invalid.identifier}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onBlur={handleIdentifierBlur}
            required
          />
        </div>
      </div>

      <div
        className={`field field--has-toggle${invalid.password ? " is-invalid" : ""}`}
      >
        <label htmlFor="password">Mật khẩu</label>
        <div className="field-control">
          <Icon name="i-shield" className="icon field-icon" />
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            aria-invalid={invalid.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={handlePasswordBlur}
            required
          />
          <button
            type="button"
            className={`field-toggle${showPassword ? " is-on" : ""}`}
            aria-controls="password"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            onClick={toggleShowPassword}
          >
            <Icon name="i-eye" className="icon icon-eye" />
            <Icon name="i-eye-off" className="icon icon-eye-off" />
          </button>
        </div>
      </div>

      <div className="auth-row">
        <label className="auth-check" htmlFor="remember">
          <input type="checkbox" id="remember" name="remember" />
          Ghi nhớ đăng nhập
        </label>
      </div>

      <button
        type="submit"
        className={`btn btn-primary btn-lg auth-submit${loading ? " is-loading" : ""}`}
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