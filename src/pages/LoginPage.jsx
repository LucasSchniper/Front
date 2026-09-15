import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useMsal } from "@azure/msal-react";
import AuthShell from "../components/auth/AuthShell";
import { useAuth } from "../context/AuthContext";

const MSAL_SCOPES = ["openid", "profile", "email"];

function LoginPage() {
  const { loginWithOAuth } = useAuth();
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuth = async (provider, credential) => {
    setError("");
    setLoading(true);
    const result = await loginWithOAuth(provider, credential);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (result.isNew) {
      navigate("/completar-perfil", {
        state: { regToken: result.regToken, perfil: result.perfil, provider: result.provider },
      });
      return;
    }

    navigate(`/${result.role}`, { replace: true });
  };

  const handleMicrosoft = async () => {
    setError("");
    try {
      const respuesta = await instance.loginPopup({ scopes: MSAL_SCOPES });
      await handleOAuth("microsoft", respuesta.idToken);
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión con Microsoft.");
    }
  };

  return (
    <AuthShell title="Log in" subtitle="Ingresá con tu cuenta de Google o Microsoft.">
      <div className="auth-card__form">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={(credentialResponse) => handleOAuth("google", credentialResponse.credential)}
            onError={() => setError("No se pudo iniciar sesión con Google.")}
          />
        </div>

        <button
          type="button"
          className="btn btn--primary auth-card__submit"
          onClick={handleMicrosoft}
          disabled={loading}
        >
          Continuar con Microsoft
        </button>

        {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
      </div>
    </AuthShell>
  );
}

export default LoginPage;
