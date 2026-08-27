import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { IconCheck, IconClose, IconShield, IconTrash } from "../../components/icons/Icons";

function AdminMedicos() {
  const { solicitudesPendientes, aprobarMedico, rechazarMedico } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarMedicos = () => {
    setLoading(true);
    api.medicos
      .listar()
      .then((data) => setMedicos(data.medicos))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarMedicos();
  }, []);

  const handleAprobar = async (id) => {
    setError("");
    try {
      await aprobarMedico(id);
      cargarMedicos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRechazar = async (id) => {
    setError("");
    try {
      await rechazarMedico(id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminar = async (id) => {
    setError("");
    try {
      await api.medicos.eliminar(id);
      setMedicos((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Médicos</h1>
          <p className="page-subtitle">Aprobá solicitudes y gestioná el acceso de profesionales médicos.</p>
        </div>
      </div>

      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}

      <section className="requests">
        <h2 className="section-title">
          <IconShield size={18} /> Solicitudes de registro
          {solicitudesPendientes.length > 0 && (
            <span className="section-title__count">{solicitudesPendientes.length}</span>
          )}
        </h2>

        {solicitudesPendientes.length === 0 ? (
          <p className="requests__empty">No hay solicitudes pendientes de aprobación.</p>
        ) : (
          <div className="request-list">
            {solicitudesPendientes.map((s) => (
              <article className="request-card" key={s.id}>
                <div>
                  <p className="request-card__name">
                    {s.nombre} {s.apellido}
                  </p>
                  <p className="request-card__meta">
                    {s.email} · DNI {s.dni || "—"} · Matrícula {s.matricula || "—"} · solicitado el{" "}
                    {s.fecha}
                  </p>
                </div>
                <div className="request-card__actions">
                  <button className="btn btn--primary btn--sm" onClick={() => handleAprobar(s.id)}>
                    <IconCheck size={16} /> Aprobar
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => handleRechazar(s.id)}>
                    <IconClose size={16} /> Rechazar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <h2 className="section-title">Médicos con acceso</h2>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Mail</th>
              <th>Matrícula</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {medicos.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.nombre} {m.apellido}
                </td>
                <td>{m.mail}</td>
                <td>{m.matricula || "—"}</td>
                <td>
                  <button
                    className="icon-btn icon-btn--danger"
                    aria-label={`Eliminar a ${m.nombre}`}
                    onClick={() => handleEliminar(m.id)}
                  >
                    <IconTrash size={17} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && medicos.length === 0 && (
              <tr>
                <td colSpan={4} className="data-table__empty">
                  Todavía no hay médicos aprobados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminMedicos;
