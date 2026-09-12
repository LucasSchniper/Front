import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

function VerifyCodePage() {
  const { pendingAuth, confirmCode } = useAuth();
  const navigate = useNavigate();
  const [session] = useState(() => pendingAuth);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    if (session?.rol) {
      api.verificacion.enviar({ mail: session.email, rol: session.rol }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return <Navigate to="/login" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const result = await confirmCode(code);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(`/${result.role}`, { replace: true });
  };

  const handleReenviar = async () => {
    if (!session?.rol || reenviando) return;
    setError("");
    setInfo("");
    setReenviando(true);
    try {
      await api.verificacion.enviar({ mail: session.email, rol: session.rol });
      setInfo("Te reenviamos el código.");
    } catch (err) {
      setError(err.message);
    } finally {
      setReenviando(false);
    }
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
        {info && <p className="auth-card__feedback auth-card__feedback--success">{info}</p>}

        <button type="submit" className="btn btn--primary auth-card__submit" disabled={loading}>
          {loading ? "Verificando…" : "Confirmar"}
        </button>

        {session.rol && (
          <p className="auth-card__hint">
            ¿No te llegó?{" "}
            <button
              type="button"
              onClick={handleReenviar}
              disabled={reenviando}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                font: "inherit",
                color: "var(--maroon)",
                fontWeight: 700,
                textDecoration: "underline",
                cursor: reenviando ? "default" : "pointer",
              }}
            >
              {reenviando ? "Reenviando…" : "Reenviar código"}
            </button>
          </p>
        )}
      </form>
    </AuthShell>
  );
}

export default VerifyCodePage;
