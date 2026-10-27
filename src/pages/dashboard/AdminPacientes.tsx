import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { IconAlert, IconChat, IconPatient, IconSearch } from "../../components/icons/Icons";
import { mensajeDeError } from "../../utils/errors";
import type { Medico, Paciente } from "../../types";
import type { NuevoChatState } from "./Chats";

const SIN_ASIGNAR = "";

function AdminPacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [asignandoId, setAsignandoId] = useState<Paciente["id"] | null>(null);
  const [query, setQuery] = useState("");
  const [soloSinAsignar, setSoloSinAsignar] = useState(false);

  const cargar = () => {
    setLoading(true);
    setError("");
    Promise.all([api.usuarios.listar(), api.medicos.listar()])
      .then(([pacientesData, medicosData]) => {
        setPacientes(pacientesData.pacientes);
        setMedicos(medicosData.medicos);
      })
      .catch((err: unknown) => setError(mensajeDeError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const sinAsignar = useMemo(
    () => pacientes.filter((p) => !p.medico_id).length,
    [pacientes]
  );

  // Si ya no quedan pacientes sin médico, el filtro deja de tener sentido y se muestran todos.
  const filtrarSinAsignar = soloSinAsignar && sinAsignar > 0;
  const pacientesFiltrados = pacientes.filter(
    (p) =>
      (!filtrarSinAsignar || !p.medico_id) &&
      `${p.nombre} ${p.apellido} ${p.dni ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleAsignar = async (pacienteId: Paciente["id"], medicoId: string) => {
    setError("");
    setAsignandoId(pacienteId);
    try {
      const { paciente } = await api.usuarios.asignarMedico(pacienteId, medicoId || null);
      setPacientes((prev) => prev.map((p) => (p.id === pacienteId ? paciente : p)));
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setAsignandoId(null);
    }
  };

  const handleEscribir = (p: Paciente) => {
    const state: NuevoChatState = {
      nuevoChat: { tipo: "paciente", id: p.id, nombre: `${p.nombre} ${p.apellido}` },
    };
    navigate("/administrador/chats", { state });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">Designá el médico que va a seguir cada caso.</p>
        </div>
      </div>

      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}

      {sinAsignar > 0 && (
        <div className="aviso-asignacion" role="status">
          <span className="aviso-asignacion__icon" aria-hidden="true">
            <IconAlert size={18} />
          </span>
          <div className="aviso-asignacion__texto">
            <p className="aviso-asignacion__titulo">
              {sinAsignar === 1
                ? "Hay 1 paciente sin médico asignado"
                : `Hay ${sinAsignar} pacientes sin médico asignado`}
            </p>
            <p className="aviso-asignacion__detalle">
              Asignales un médico para que puedan empezar su seguimiento.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm aviso-asignacion__btn"
            aria-pressed={filtrarSinAsignar}
            onClick={() => setSoloSinAsignar((v) => !v)}
          >
            {filtrarSinAsignar ? "Ver todos" : "Ver sin asignar"}
          </button>
        </div>
      )}

      <label className="dash-search dash-search--page">
        <IconSearch size={16} />
        <input
          type="search"
          placeholder="Buscar pacientes"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Médico asignado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.map((p) => (
              <tr key={p.id}>
                <td>
                  <span className="data-table__nombre">
                    <span className="data-table__avatar" aria-hidden="true">
                      <IconPatient size={16} />
                    </span>
                    {p.nombre} {p.apellido}
                  </span>
                </td>
                <td className="data-table__muted">{p.dni || "—"}</td>
                <td>
                  <select
                    className={`data-table__select${p.medico_id ? "" : " data-table__select--vacio"}`}
                    aria-label={`Médico asignado a ${p.nombre}`}
                    value={p.medico_id || SIN_ASIGNAR}
                    disabled={asignandoId === p.id || medicos.length === 0}
                    onChange={(e) => handleAsignar(p.id, e.target.value)}
                  >
                    <option value={SIN_ASIGNAR}>Sin asignar</option>
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} {m.apellido}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="data-table__actions">
                    <button className="btn btn--ghost btn--sm" onClick={() => handleEscribir(p)}>
                      <IconChat size={16} /> Escribir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && pacientes.length === 0 && (
              <tr>
                <td colSpan={4} className="data-table__empty">
                  Todavía no hay pacientes registrados.
                </td>
              </tr>
            )}
            {pacientes.length > 0 && pacientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={4} className="data-table__empty">
                  Sin pacientes que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPacientes;
