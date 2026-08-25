import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import FormField from "../components/auth/FormField";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate("/verificar");
  };

  return (
    <AuthShell title="Log in" subtitle="Ingresá con tu mail y contraseña.">
      <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
        <FormField label="Mail" id="login-email">
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={update("email")}
          />
        </FormField>

        <FormField label="Contraseña" id="login-password">
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={update("password")}
          />
        </FormField>

        {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}

        <button type="submit" className="btn btn--primary auth-card__submit" disabled={loading}>
          {loading ? "Ingresando…" : "Ingresar"}
        </button>

        <p className="auth-card__switch">
          ¿No tenés cuenta? <Link to="/signup">Registrate</Link>
        </p>
        <p className="auth-card__hint">
          Demo: medico@deca.com / paciente@deca.com / admin@deca.com — clave deca123.
          nuevo.medico@deca.com está pendiente de aprobación del administrador.
        </p>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
