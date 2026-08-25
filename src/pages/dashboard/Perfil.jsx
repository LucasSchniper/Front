import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { IconUserCircle } from "../../components/icons/Icons";

function Perfil() {
  const { currentUser } = useAuth();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError("");

    const pedido =
      currentUser.role === "medico" ? api.medicos.perfil() : api.usuarios.perfil();

    pedido
      .then((data) => {
        if (cancelado) return;
        setDatos(data.paciente || data.medico);
      })
      .catch((err) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [currentUser.role]);

  return (
    <div className="profile-page">
      <h1 className="page-title">Mi perfil</h1>
      <p className="page-subtitle">Tus datos personales y de acceso.</p>

      {loading && <p className="empty-state">Cargando…</p>}
      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}

      {datos && (
        <div className="panel-form panel-form--centered">
          <div className="profile-photo">
            <span className="profile-photo__avatar">
              <IconUserCircle size={64} />
            </span>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="perfil-nombre">Nombre</label>
              <input id="perfil-nombre" value={`${datos.nombre} ${datos.apellido}`} disabled />
            </div>
            <div className="form-field">
              <label htmlFor="perfil-mail">Mail</label>
              <input id="perfil-mail" type="email" value={datos.mail} disabled />
            </div>
          </div>

          <div className="form-row">
            {"dni" in datos && (
              <div className="form-field">
                <label htmlFor="perfil-dni">DNI</label>
                <input id="perfil-dni" value={datos.dni} disabled />
              </div>
            )}
            {"obra_social" in datos && (
              <div className="form-field">
                <label htmlFor="perfil-obra-social">Obra social</label>
                <input id="perfil-obra-social" value={datos.obra_social || "—"} disabled />
              </div>
            )}
          </div>

          <p className="auth-card__hint">
            La edición de perfil todavía no está disponible: al backend le falta el endpoint para
            actualizar estos datos.
          </p>
        </div>
      )}
    </div>
  );
}

export default Perfil;
