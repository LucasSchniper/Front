import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import EcgLine from "../EcgLine";
import Logo from "../Logo";

interface AuthShellProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="auth-page">
      <header className="auth-page__top">
        <Link to="/" className="auth-page__brand" aria-label="Volver al inicio de DECA">
          <Logo pulse />
        </Link>
      </header>

      <main className="auth-page__body">
        <div className="auth-page__circle auth-page__circle--a" />
        <div className="auth-page__circle auth-page__circle--b" />

        <div className="auth-page__row">
          <EcgLine className="auth-page__ecg auth-page__ecg--left" height={80} color="var(--maroon)" />

          <div className="auth-card">
            <h1 className="auth-card__title">{title}</h1>
            {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
            {children}
          </div>

          <EcgLine className="auth-page__ecg auth-page__ecg--right" height={80} reverse color="var(--maroon)" />
        </div>
      </main>

      <div className="section-divider" role="presentation" />
    </div>
  );
}

export default AuthShell;
