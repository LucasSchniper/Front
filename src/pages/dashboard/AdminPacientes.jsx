import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";

const SIN_ASIGNAR = "";

function AdminPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [asignandoId, setAsignandoId] = useState(null);

  const cargar = () => {
    setLoading(true);
    setError("");
    Promise.all([api.usuarios.listar(), api.medicos.listar()])
      .then(([pacientesData, medicosData]) => {
        setPacientes(pacientesData.pacientes);
        setMedicos(medicosData.medicos);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const sinAsignar = useMemo(
    () => pacientes.filter((p) => !p.medico_id).length,
    [pacientes]
  );

  const handleAsignar = async (pacienteId, medicoId) => {
    setError("");
    setAsignandoId(pacienteId);
    try {
      const { paciente } = await api.usuarios.asignarMedico(pacienteId, medicoId || null);
      setPacientes((prev) => prev.map((p) => (p.id === pacienteId ? paciente : p)));
    } catch (err) {
      setError(err.message);
    } finally {
      setAsignandoId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">
            Designá el médico que va a seguir cada caso.
          </p>
        </div>
      </div>

      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}

      {sinAsignar > 0 && (
        <p className="auth-card__feedback">
          {sinAsignar === 1
            ? "Hay 1 paciente sin médico asignado."
            : `Hay ${sinAsignar} pacientes sin médico asignado.`}
        </p>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Médico asignado</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.nombre} {p.apellido}
                </td>
                <td>{p.dni}</td>
                <td>
                  <select
                    aria-label={`Médico asignado a ${p.nombre}`}
                    value={p.medico_id || SIN_ASIGNAR}
                    disabled={asignandoId === p.id}
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
              </tr>
            ))}
            {!loading && pacientes.length === 0 && (
              <tr>
                <td colSpan={3} className="data-table__empty">
                  Todavía no hay pacientes registrados.
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
