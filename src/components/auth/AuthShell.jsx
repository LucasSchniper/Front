import { Link } from "react-router-dom";
import EcgLine from "../EcgLine";
import Logo from "../Logo";

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-page__circle auth-page__circle--a" />
      <div className="auth-page__circle auth-page__circle--b" />

      <Link to="/" className="auth-page__brand">
        <Logo pulse />
      </Link>

      <div className="auth-page__row">
        <EcgLine className="auth-page__ecg auth-page__ecg--left" height={80} color="var(--maroon)" />

        <div className="auth-card">
          <h1 className="auth-card__title">{title}</h1>
          {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
          {children}
        </div>

        <EcgLine className="auth-page__ecg auth-page__ecg--right" height={80} reverse color="var(--maroon)" />
      </div>
    </div>
  );
}

export default AuthShell;
