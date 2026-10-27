import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";

interface GoogleAccessButtonProps {
  text: "signin_with" | "signup_with";
  onError: (mensaje: string) => void;
  onPendingApproval?: () => void;
}

/**
 * Acceso con Google. Sólo entra a cuentas creadas con Google: si el mail ya
 * está registrado con contraseña el back lo rechaza. Si no existe, pasa a
 * completar el perfil.
 */
/** Ancho y alto con los que Google dibuja su botón (no se puede agrandar más). */
const GOOGLE_ANCHO = 400;
const GOOGLE_ALTO = 44;

const ETIQUETAS = {
  signin_with: "Iniciar sesión con Google",
  signup_with: "Registrarse con Google",
};

function GoogleAccessButton({ text, onError, onPendingApproval }: GoogleAccessButtonProps) {
  const { loginWithOAuth } = useAuth();
  const navigate = useNavigate();

  // El botón de Google es un iframe de tamaño fijo: mostramos uno propio del
  // tamaño de los inputs y estiramos el de Google, invisible, por encima.
  const contenedor = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState({ x: 1, y: 1 });
  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const medir = () => setEscala({ x: el.offsetWidth / GOOGLE_ANCHO, y: el.offsetHeight / GOOGLE_ALTO });
    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      <div className="auth-card__google" ref={contenedor}>
        <span className="auth-card__google-cara" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {ETIQUETAS[text]}
        </span>
        <div
          className="auth-card__google-real"
          style={{ width: GOOGLE_ANCHO, height: GOOGLE_ALTO, transform: `scale(${escala.x}, ${escala.y})` }}
        >
          <GoogleLogin
            text={text}
            size="large"
            width={String(GOOGLE_ANCHO)}
            locale="es"
            onSuccess={(credentialResponse) => handleCredential(credentialResponse.credential)}
            onError={() => onError("No se pudo acceder con Google.")}
          />
        </div>
      </div>
    </>
  );
}

export default GoogleAccessButton;
