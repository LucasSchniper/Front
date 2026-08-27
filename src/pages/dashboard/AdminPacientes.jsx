import { useMemo, useState } from "react";
import { MOCK_PACIENTES, MOCK_MEDICOS } from "../../data/mockData";
import { IconPlus, IconTrash } from "../../components/icons/Icons";
import {
  SIN_ASIGNAR,
  asignarMedico,
  leerAsignaciones,
  olvidarPaciente,
} from "../../services/asignaciones";

const PACIENTES_KEY = "deca_padron_pacientes";

function cargarPadron() {
  try {
    const raw = localStorage.getItem(PACIENTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_PACIENTES;
}

function guardarPadron(pacientes) {
  try {
    localStorage.setItem(PACIENTES_KEY, JSON.stringify(pacientes));
  } catch {}
}

function AdminPacientes() {
  const [pacientes, setPacientes] = useState(cargarPadron);
  const [asignaciones, setAsignaciones] = useState(() => leerAsignaciones(cargarPadron()));
  const [form, setForm] = useState({ nombre: "", dni: "", medicoId: SIN_ASIGNAR });
  const [showForm, setShowForm] = useState(false);

  const sinAsignar = useMemo(
    () => pacientes.filter((p) => !asignaciones[p.id]).length,
    [pacientes, asignaciones]
  );

  const actualizarPadron = (siguiente) => {
    setPacientes(siguiente);
    guardarPadron(siguiente);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.dni) return;
    const id = `p${Date.now()}`;
    actualizarPadron([...pacientes, { id, nombre: form.nombre, dni: form.dni }]);
    if (form.medicoId) setAsignaciones((prev) => asignarMedico(prev, id, form.medicoId));
    setForm({ nombre: "", dni: "", medicoId: SIN_ASIGNAR });
    setShowForm(false);
  };

  const handleRemove = (id) => {
    actualizarPadron(pacientes.filter((p) => p.id !== id));
    setAsignaciones((prev) => olvidarPaciente(prev, id));
  };

  const handleAsignar = (pacienteId, medicoId) => {
    setAsignaciones((prev) => asignarMedico(prev, pacienteId, medicoId));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">
            Designá pacientes y asigná el médico que va a seguir cada caso.
          </p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setShowForm((v) => !v)}>
          <IconPlus size={16} /> Designar paciente
        </button>
      </div>

      {sinAsignar > 0 && (
        <p className="auth-card__feedback">
          {sinAsignar === 1
            ? "Hay 1 paciente sin médico asignado."
            : `Hay ${sinAsignar} pacientes sin médico asignado.`}
        </p>
      )}

      {showForm && (
        <form className="inline-form" onSubmit={handleAdd}>
          <input
            placeholder="Nombre y apellido"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            required
          />
          <input
            placeholder="DNI"
            value={form.dni}
            onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
            required
          />
          <select
            aria-label="Médico asignado"
            value={form.medicoId}
            onChange={(e) => setForm((f) => ({ ...f, medicoId: e.target.value }))}
          >
            <option value={SIN_ASIGNAR}>Sin asignar</option>
            {MOCK_MEDICOS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn--primary btn--sm">
            Guardar
          </button>
        </form>
      )}

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
            {pacientes.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.dni}</td>
                <td>
                  <select
                    aria-label={`Médico asignado a ${p.nombre}`}
                    value={asignaciones[p.id] || SIN_ASIGNAR}
                    onChange={(e) => handleAsignar(p.id, e.target.value)}
                  >
                    <option value={SIN_ASIGNAR}>Sin asignar</option>
                    {MOCK_MEDICOS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="icon-btn icon-btn--danger"
                    aria-label={`Eliminar a ${p.nombre}`}
                    onClick={() => handleRemove(p.id)}
                  >
                    <IconTrash size={17} />
                  </button>
                </td>
              </tr>
            ))}
            {pacientes.length === 0 && (
              <tr>
                <td colSpan={4} className="data-table__empty">
                  Todavía no hay pacientes designados.
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
