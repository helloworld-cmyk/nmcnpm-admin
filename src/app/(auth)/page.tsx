import { Reveal } from "@/components/reveal";
import { AuthGate } from "./_components/auth-gate";
import { LoginForm } from "./_components/login-form";
import "./_components/auth.css";

export default function LoginPage() {
  return (
    <AuthGate>
      <a className="skip-link" href="#main">
        Bỏ qua điều hướng
      </a>
      <main id="main" className="auth">
        <div className="container auth-wrap">
          <Reveal className="auth-reveal">
            <section className="auth-card" aria-labelledby="dang-nhap">
              <h1 id="dang-nhap">Đăng nhập</h1>
              <p className="auth-lead">
                Đăng nhập để quản lý chuyến đi, tài xế và vận hành hệ thống Vi
                Vu Việt.
              </p>
              <LoginForm />
            </section>
          </Reveal>
        </div>
      </main>
    </AuthGate>
  );
}