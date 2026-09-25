import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";

interface GoogleAccessButtonProps {
  text: "signin_with" | "signup_with";
  onError: (mensaje: string) => void;
  onPendingApproval?: () => void;
}

/**
 * Acceso con Google. Si el mail ya tiene cuenta en DECA (aunque se haya creado
 * a mano) el back devuelve esa misma cuenta; si no existe, pasa a completar el
 * perfil, donde además se le pide una contraseña para entrar sin Google.
 */
function GoogleAccessButton({ text, onError, onPendingApproval }: GoogleAccessButtonProps) {
  const { loginWithOAuth } = useAuth();
  const navigate = useNavigate();

  const handleCredential = async (credential: string | undefined) => {
    onError("");
    const result = await loginWithOAuth("google", credential);

    if (!result.ok) {
      onError(result.error);
      return;
    }
    if (result.isNew) {
      navigate("/completar-perfil", {
        state: { regToken: result.regToken, perfil: result.perfil, provider: result.provider },
      });
      return;
    }
    if (result.pendingApproval) {
      onPendingApproval?.();
      return;
    }
    navigate(`/${result.role}`, { replace: true });
  };

  return (
    <>
      <div className="auth-card__divider">
        <span>o</span>
      </div>
      <div className="auth-card__google">
        <GoogleLogin
          text={text}
          shape="pill"
          locale="es"
          onSuccess={(credentialResponse) => handleCredential(credentialResponse.credential)}
          onError={() => onError("No se pudo acceder con Google.")}
        />
      </div>
    </>
  );
}

export default GoogleAccessButton;
