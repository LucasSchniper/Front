import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import FormField from "../components/auth/FormField";
import GoogleAccessButton from "../components/auth/GoogleAccessButton";
import { useAuth } from "../context/AuthContext";

const PENDIENTE_APROBACION =
  "Tu cuenta de médico está esperando que el administrador apruebe tu matrícula. Te avisamos por mail cuando esté lista.";

function LoginPage() {
  const { loginWithPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mailInicial = (location.state as { mail?: string } | null)?.mail ?? "";

  const [mail, setMail] = useState(mailInicial);
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cuentaInexistente, setCuentaInexistente] = useState(false);
  const [loading, setLoading] = useState(false);

  const mostrarError = (mensaje: string) => {
    setCuentaInexistente(false);
    setError(mensaje);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mail.trim() || !contrasena) {
      mostrarError("Ingresá tu mail y tu contraseña.");
      return;
    }

    mostrarError("");
    setLoading(true);
    const result = await loginWithPassword({ mail, contrasena });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      setCuentaInexistente(!!result.cuentaInexistente);
      return;
    }
    if (result.pendingApproval) {
      setError(PENDIENTE_APROBACION);
      return;
    }
    navigate(`/${result.role}`, { replace: true });
  };

  return (
    <AuthShell title="Log in">
      <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
        <FormField label="Mail" id="login-email" hideLabel>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            placeholder="Mail"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
          />
        </FormField>

        <FormField label="Contraseña" id="login-password" hideLabel>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </FormField>

        {cuentaInexistente ? (
          <div className="auth-card__notice auth-card__notice--stack">
            <span>
              No encontramos una cuenta con <strong>{mail.trim()}</strong>. ¿Querés crearla?
            </span>
            <Link
              to="/signup"
              state={{ mail: mail.trim() }}
              className="btn btn--ghost btn--sm auth-card__submit"
            >
              Registrar este mail
            </Link>
          </div>
        ) : (
          error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>
        )}

        <button type="submit" className="btn btn--primary auth-card__submit" disabled={loading}>
          {loading ? "Ingresando…" : "Iniciar sesión"}
        </button>

        <GoogleAccessButton
          text="signin_with"
          onError={mostrarError}
          onPendingApproval={() => mostrarError(PENDIENTE_APROBACION)}
        />

        <p className="auth-card__switch">
          ¿No tenés cuenta? <Link to="/signup">Registrate</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
