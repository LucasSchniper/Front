import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import FormField from "../components/auth/FormField";
import GoogleAccessButton from "../components/auth/GoogleAccessButton";
import RoleFields from "../components/auth/RoleFields";
import SolicitudEnviada from "../components/auth/SolicitudEnviada";
import { useSignupForm } from "../components/auth/useSignupForm";
import { useAuth } from "../context/AuthContext";
import {
  CREDENTIAL_FIELDS,
  MAX_LENGTH,
  MIN_PASSWORD,
  normalizeSignup,
  splitNombreCompleto,
} from "../utils/signupValidation";

function SignupPage() {
  const { signupWithPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mailInicial = (location.state as { mail?: string } | null)?.mail ?? "";

  const { form, errors, update, validate } = useSignupForm({ mail: mailInicial });
  const [error, setError] = useState("");
  const [mailEnUso, setMailEnUso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  const mostrarError = (mensaje: string) => {
    setMailEnUso(false);
    setError(mensaje);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const resumen = validate(CREDENTIAL_FIELDS);
    mostrarError(resumen);
    if (resumen) return;

    setLoading(true);
    const result = await signupWithPassword({
      ...splitNombreCompleto(form.nombreCompleto),
      mail: form.mail,
      contrasena: form.contrasena,
      ...normalizeSignup(form),
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      setMailEnUso(!!result.mailEnUso);
      return;
    }
    if (result.pendingApproval) {
      setSolicitudEnviada(true);
      return;
    }
    navigate(`/${result.role}`, { replace: true });
  };

  if (solicitudEnviada) {
    return <SolicitudEnviada matricula={form.matricula} email={form.mail.trim()} />;
  }

  return (
    <AuthShell title="Sign up">
      <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
        <FormField label="Nombre y apellido" id="signup-nombre" error={errors.nombreCompleto} hideLabel>
          <input
            id="signup-nombre"
            autoComplete="name"
            required
            maxLength={MAX_LENGTH.nombreCompleto}
            placeholder="Nombre y apellido"
            value={form.nombreCompleto}
            onChange={update("nombreCompleto")}
          />
        </FormField>

        <FormField label="Fecha de nacimiento" id="signup-fecha" error={errors.fechaNacimiento} hideLabel>
          <input
            id="signup-fecha"
            type={form.fechaNacimiento ? "date" : "text"}
            onFocus={(e) => {
              e.currentTarget.type = "date";
            }}
            onBlur={(e) => {
              if (!e.currentTarget.value) e.currentTarget.type = "text";
            }}
            required
            placeholder="Fecha de nacimiento"
            value={form.fechaNacimiento}
            onChange={update("fechaNacimiento")}
          />
        </FormField>

        <FormField label="Mail" id="signup-email" error={errors.mail} hideLabel>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            maxLength={MAX_LENGTH.mail}
            placeholder="Mail"
            value={form.mail}
            onChange={update("mail")}
          />
        </FormField>

        <FormField label="Contraseña" id="signup-password" error={errors.contrasena} hideLabel>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            placeholder={`Contraseña (mínimo ${MIN_PASSWORD} caracteres)`}
            value={form.contrasena}
            onChange={update("contrasena")}
          />
        </FormField>

        <RoleFields form={form} errors={errors} update={update} />

        {mailEnUso ? (
          <div className="auth-card__notice auth-card__notice--stack">
            <span>
              Ya hay una cuenta con <strong>{form.mail.trim()}</strong>. Iniciá sesión con tu
              contraseña o con Google.
            </span>
            <Link
              to="/login"
              state={{ mail: form.mail.trim() }}
              className="btn btn--ghost btn--sm auth-card__submit"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>
        )}

        <button type="submit" className="btn btn--primary auth-card__submit" disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <GoogleAccessButton
          text="signup_with"
          onError={mostrarError}
          onPendingApproval={() =>
            mostrarError("Tu cuenta de médico está esperando la aprobación del administrador.")
          }
        />

        <p className="auth-card__switch">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default SignupPage;
