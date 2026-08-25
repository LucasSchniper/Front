import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import { useAuth } from "../context/AuthContext";

function VerifyCodePage() {
  const { pendingAuth, confirmCode } = useAuth();
  const navigate = useNavigate();
  const [session] = useState(() => pendingAuth);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!session) return <Navigate to="/login" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = confirmCode(code);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate(`/${result.role}`, { replace: true });
    }, 500);
  };

  return (
    <AuthShell
      title="Verificá tu mail"
      subtitle={`Te enviamos un código de confirmación a ${session.email}.`}
    >
      <form className="auth-card__form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="verify-code">Código de confirmación</label>
          <input
            id="verify-code"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="verify-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />
        </div>

        {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}

        <button type="submit" className="btn btn--primary auth-card__submit" disabled={loading}>
          {loading ? "Verificando…" : "Confirmar"}
        </button>

        <p className="auth-card__hint">
          Demo: ingresá cualquier código de 4 a 6 dígitos, todavía no hay envío real de mail.
        </p>
      </form>
    </AuthShell>
  );
}

export default VerifyCodePage;
