import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import FormField from "../components/auth/FormField";
import { useAuth } from "../context/AuthContext";
import { OBRAS_SOCIALES } from "../data/mockData";
import { IconCheck, IconShield } from "../components/icons/Icons";
import {
  MAX_LENGTH,
  OTRA_OBRA_SOCIAL,
  SIN_OBRA_SOCIAL,
  pideCredencial,
  sanitizeField,
  summarizeErrors,
  validateSignup,
} from "../utils/signupValidation";

const EMPTY = {
  nombre: "",
  apellido: "",
  fechaNacimiento: "",
  email: "",
  password: "",
  role: "",
  dni: "",
  obraSocial: "",
  obraSocialOtra: "",
  credencial: "",
  matricula: "",
};

const ROLE_DEPENDENT_ERRORS = [
  "role",
  "dni",
  "obraSocial",
  "obraSocialOtra",
  "credencial",
  "matricula",
];

const OBRA_SOCIAL_DEPENDENT_ERRORS = ["obraSocial", "obraSocialOtra", "credencial"];

const sinErroresDe = (errores, campos) =>
  Object.fromEntries(Object.entries(errores).filter(([campo]) => !campos.includes(campo)));

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  const update = (field) => (e) => {
    const value = sanitizeField(field, e.target.value);
    setForm((f) => ({ ...f, [field]: value }));

    if (field === "role") {
      setErrors((prev) => sinErroresDe(prev, ROLE_DEPENDENT_ERRORS));
      setError("");
      return;
    }

    if (field === "obraSocial") {
      if (value === SIN_OBRA_SOCIAL) setForm((f) => ({ ...f, credencial: "" }));
      setErrors((prev) => sinErroresDe(prev, OBRA_SOCIAL_DEPENDENT_ERRORS));
      setError("");
      return;
    }

    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _omit, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validation = validateSignup(form);
    if (!validation.ok) {
      setErrors(validation.errors);
      setError(summarizeErrors(validation));
      return;
    }
    setErrors({});

    setLoading(true);
    const result = await signUp(form);
    setLoading(false);
    if (!result.ok) {
      setErrors(result.errors || {});
      setError(result.error);
      return;
    }
    if (result.pendingApproval) {
      setSolicitudEnviada(true);
      return;
    }
    navigate("/verificar");
  };

  if (solicitudEnviada) {
    return (
      <AuthShell title="Solicitud enviada" subtitle="Falta un último paso: la validación.">
        <div className="auth-card__form">
          <p className="auth-card__feedback auth-card__feedback--success">
            <IconCheck size={16} /> Recibimos tu registro como médico.
          </p>
          <p className="auth-card__notice">
            <IconShield size={18} />
            <span>
              El administrador de DECA va a revisar tu matrícula <strong>{form.matricula}</strong>{" "}
              para confirmar que sos profesional médico. Cuando la apruebe te avisamos a{" "}
              <strong>{form.email}</strong> y vas a poder iniciar sesión.
            </span>
          </p>
          <Link to="/login" className="btn btn--primary auth-card__submit">
            Volver al inicio de sesión
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Sign up" subtitle="Creá tu cuenta en DECA.">
      <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <FormField label="Nombre" id="signup-nombre" error={errors.nombre}>
            <input
              id="signup-nombre"
              required
              maxLength={MAX_LENGTH.nombre}
              value={form.nombre}
              onChange={update("nombre")}
            />
          </FormField>
          <FormField label="Apellido" id="signup-apellido" error={errors.apellido}>
            <input
              id="signup-apellido"
              required
              maxLength={MAX_LENGTH.apellido}
              value={form.apellido}
              onChange={update("apellido")}
            />
          </FormField>
        </div>

        <FormField label="Fecha de nacimiento" id="signup-fecha" error={errors.fechaNacimiento}>
          <input
            id="signup-fecha"
            type="date"
            required
            value={form.fechaNacimiento}
            onChange={update("fechaNacimiento")}
          />
        </FormField>

        <FormField label="Mail" id="signup-email" error={errors.email}>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            maxLength={MAX_LENGTH.email}
            value={form.email}
            onChange={update("email")}
          />
        </FormField>

        <FormField label="Contraseña" id="signup-password" error={errors.password}>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            maxLength={MAX_LENGTH.password}
            value={form.password}
            onChange={update("password")}
          />
        </FormField>

        <fieldset className="role-picker">
          <legend>Sos...</legend>
          <label className={`role-picker__option ${form.role === "medico" ? "is-selected" : ""}`}>
            <input
              type="radio"
              name="role"
              value="medico"
              checked={form.role === "medico"}
              onChange={update("role")}
            />
            Médico
          </label>
          <label className={`role-picker__option ${form.role === "paciente" ? "is-selected" : ""}`}>
            <input
              type="radio"
              name="role"
              value="paciente"
              checked={form.role === "paciente"}
              onChange={update("role")}
            />
            Paciente
          </label>
        </fieldset>
        {errors.role && <span className="form-field__error">{errors.role}</span>}

        {form.role && (
          <FormField label="DNI" id="signup-dni" error={errors.dni}>
            <input
              id="signup-dni"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              maxLength={MAX_LENGTH.dni}
              placeholder="00000000"
              value={form.dni}
              onChange={update("dni")}
            />
            <span className="form-field__hint">Sólo números, 7 u 8 dígitos.</span>
          </FormField>
        )}

        {form.role === "paciente" && (
          <>
            <FormField label="Obra social" id="signup-obra" error={errors.obraSocial}>
              <select id="signup-obra" required value={form.obraSocial} onChange={update("obraSocial")}>
                <option value="">Elegí tu obra social</option>
                {OBRAS_SOCIALES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </FormField>

            {form.obraSocial === OTRA_OBRA_SOCIAL && (
              <FormField
                label="¿Cuál?"
                id="signup-obra-otra"
                error={errors.obraSocialOtra}
              >
                <input
                  id="signup-obra-otra"
                  required
                  maxLength={MAX_LENGTH.obraSocialOtra}
                  placeholder="Nombre de tu obra social o prepaga"
                  value={form.obraSocialOtra}
                  onChange={update("obraSocialOtra")}
                />
              </FormField>
            )}

            {pideCredencial(form) && (
              <FormField
                label="Número de credencial"
                id="signup-credencial"
                error={errors.credencial}
              >
                <input
                  id="signup-credencial"
                  inputMode="numeric"
                  required
                  maxLength={MAX_LENGTH.credencial}
                  placeholder="000000000000"
                  value={form.credencial}
                  onChange={update("credencial")}
                />
                <span className="form-field__hint">
                  El número que figura en tu credencial del plan.
                </span>
              </FormField>
            )}
          </>
        )}

        {form.role === "medico" && (
          <>
            <FormField label="Matrícula" id="signup-matricula" error={errors.matricula}>
              <input
                id="signup-matricula"
                required
                maxLength={MAX_LENGTH.matricula}
                placeholder="MP-10234"
                value={form.matricula}
                onChange={update("matricula")}
              />
            </FormField>

            <p className="auth-card__notice">
              <IconShield size={18} />
              <span>
                Las cuentas de médico las valida el administrador de DECA. Al crearla le llega tu
                solicitud y vas a poder ingresar en cuanto la apruebe.
              </span>
            </p>
          </>
        )}

        {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}

        <button type="submit" className="btn btn--primary auth-card__submit" disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <p className="auth-card__switch">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default SignupPage;
