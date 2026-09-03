import { useEffect, useMemo, useState } from "react";
import { api } from "../../services/api";
<<<<<<< HEAD
import {
  SIN_ASIGNAR,
  asignarMedico,
  leerAsignaciones,
  medicoDePaciente,
} from "../../services/asignaciones";

const nombreCompleto = (persona) =>
  `${persona.nombre || ""} ${persona.apellido || ""}`.trim() || persona.mail || "—";
=======

const SIN_ASIGNAR = "";
>>>>>>> f1eb5522db192271a92e2f7a114eced85f4cd1be

function AdminPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
<<<<<<< HEAD
  const [asignaciones, setAsignaciones] = useState(leerAsignaciones);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pacientes y medicos salen de la API: son las mismas cuentas que despues
  // van a loguearse, asi que los ids del mapa de asignaciones son los reales.
  useEffect(() => {
    let cancelado = false;
    Promise.all([api.usuarios.listar(), api.medicos.listar()])
      .then(([dataPacientes, dataMedicos]) => {
        if (cancelado) return;
        setPacientes(dataPacientes.pacientes || []);
        setMedicos(dataMedicos.medicos || []);
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
  }, []);

  const sinAsignar = useMemo(
    () => pacientes.filter((p) => !medicoDePaciente(asignaciones, p.id)).length,
    [pacientes, asignaciones]
  );

  const handleAsignar = (pacienteId, medicoId) => {
    setAsignaciones((prev) => asignarMedico(prev, pacienteId, medicoId));
=======
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
>>>>>>> f1eb5522db192271a92e2f7a114eced85f4cd1be
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">
<<<<<<< HEAD
            Asigná el médico que va a seguir cada caso. Los pacientes se dan de alta
            registrándose desde la web.
=======
            Designá el médico que va a seguir cada caso.
>>>>>>> f1eb5522db192271a92e2f7a114eced85f4cd1be
          </p>
        </div>
      </div>

      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}

<<<<<<< HEAD
      {!loading && medicos.length === 0 && (
        <p className="auth-card__feedback">
          Todavía no hay médicos aprobados. Aprobá una solicitud en Médicos para poder asignar.
        </p>
      )}

=======
>>>>>>> f1eb5522db192271a92e2f7a114eced85f4cd1be
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
<<<<<<< HEAD
                <td>{nombreCompleto(p)}</td>
                <td>{p.dni || "—"}</td>
                <td>
                  <select
                    aria-label={`Médico asignado a ${nombreCompleto(p)}`}
                    value={medicoDePaciente(asignaciones, p.id)}
=======
                <td>
                  {p.nombre} {p.apellido}
                </td>
                <td>{p.dni}</td>
                <td>
                  <select
                    aria-label={`Médico asignado a ${p.nombre}`}
                    value={p.medico_id || SIN_ASIGNAR}
                    disabled={asignandoId === p.id}
>>>>>>> f1eb5522db192271a92e2f7a114eced85f4cd1be
                    onChange={(e) => handleAsignar(p.id, e.target.value)}
                    disabled={medicos.length === 0}
                  >
                    <option value={SIN_ASIGNAR}>Sin asignar</option>
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>
<<<<<<< HEAD
                        {nombreCompleto(m)}
=======
                        {m.nombre} {m.apellido}
>>>>>>> f1eb5522db192271a92e2f7a114eced85f4cd1be
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
<<<<<<< HEAD
            {loading && (
              <tr>
                <td colSpan={3} className="data-table__empty">
                  Cargando…
                </td>
              </tr>
            )}
            {!loading && pacientes.length === 0 && (
              <tr>
                <td colSpan={3} className="data-table__empty">
=======
            {!loading && pacientes.length === 0 && (
              <tr>
                <td colSpan={3} className="data-table__empty">
>>>>>>> f1eb5522db192271a92e2f7a114eced85f4cd1be
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
