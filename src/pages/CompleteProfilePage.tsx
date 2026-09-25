import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import FormField from "../components/auth/FormField";
import RoleFields from "../components/auth/RoleFields";
import SolicitudEnviada from "../components/auth/SolicitudEnviada";
import { useSignupForm } from "../components/auth/useSignupForm";
import { useAuth } from "../context/AuthContext";
import { MIN_PASSWORD, normalizeSignup } from "../utils/signupValidation";
import type { PerfilOAuth, Provider } from "../types";

/** Lo que el botón de Google deja en el state de la navegación. */
interface CompleteProfileState {
  regToken?: string;
  perfil?: PerfilOAuth;
  provider?: Provider;
}

function CompleteProfilePage() {
  const { completeOAuthSignup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { regToken, perfil } = (location.state as CompleteProfileState | null) || {};

  const { form, errors, update, validate } = useSignupForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  if (!regToken || !perfil) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const resumen = validate(["contrasena"]);
    setError(resumen);
    if (resumen) return;

    setLoading(true);
    const result = await completeOAuthSignup({
      regToken,
      contrasena: form.contrasena,
      ...normalizeSignup(form),
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.pendingApproval) {
      setSolicitudEnviada(true);
      return;
    }
    navigate(`/${result.role}`, { replace: true });
  };

  if (solicitudEnviada) {
    return <SolicitudEnviada matricula={form.matricula} email={perfil.email} />;
  }

  return (
    <AuthShell
      title="Completá tu perfil"
      subtitle={`Entraste con Google como ${perfil.nombre} (${perfil.email}). Nos faltan algunos datos.`}
    >
      <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
        <FormField label="Fecha de nacimiento" id="signup-fecha" error={errors.fechaNacimiento}>
          <input
            id="signup-fecha"
            type="date"
            required
            value={form.fechaNacimiento}
            onChange={update("fechaNacimiento")}
          />
        </FormField>

        <FormField label="Contraseña para DECA" id="signup-password" error={errors.contrasena}>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
            value={form.contrasena}
            onChange={update("contrasena")}
          />
          <span className="form-field__hint">
            Con tu mail y esta contraseña también vas a poder entrar sin Google.
          </span>
        </FormField>

        <RoleFields form={form} errors={errors} update={update} />

        {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}

        <button type="submit" className="btn btn--primary auth-card__submit" disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
    </AuthShell>
  );
}

export default CompleteProfilePage;
