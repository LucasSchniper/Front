import { Link } from "react-router-dom";
import AuthShell from "./AuthShell";
import { IconCheck, IconShield } from "../icons/Icons";

interface SolicitudEnviadaProps {
  matricula?: string;
  email: string;
}

/** Pantalla que ve un médico recién registrado mientras el admin valida su matrícula. */
function SolicitudEnviada({ matricula, email }: SolicitudEnviadaProps) {
  return (
    <AuthShell title="Solicitud enviada" subtitle="Falta un último paso: la validación.">
      <div className="auth-card__form">
        <p className="auth-card__feedback auth-card__feedback--success">
          <IconCheck size={16} /> Recibimos tu registro como médico.
        </p>
        <p className="auth-card__notice">
          <IconShield size={18} />
          <span>
            El administrador de DECA va a revisar tu matrícula
            {matricula && (
              <>
                {" "}
                <strong>{matricula}</strong>
              </>
            )}{" "}
            para confirmar que sos profesional médico. Cuando la apruebe te avisamos a{" "}
            <strong>{email}</strong> y vas a poder iniciar sesión.
          </span>
        </p>
        <Link to="/login" className="btn btn--primary auth-card__submit">
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthShell>
  );
}

export default SolicitudEnviada;
