import { useState } from "react";
import { MOCK_PACIENTES, MOCK_MEDICOS } from "../../data/mockData";
import { IconPlus, IconTrash } from "../../components/icons/Icons";

function medicoNombre(medicoId) {
  return MOCK_MEDICOS.find((m) => m.id === medicoId)?.nombre || "Sin asignar";
}

function AdminPacientes() {
  const [pacientes, setPacientes] = useState(MOCK_PACIENTES);
  const [form, setForm] = useState({ nombre: "", dni: "", medicoId: MOCK_MEDICOS[0]?.id || "" });
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.dni) return;
    setPacientes((prev) => [...prev, { id: `p${Date.now()}`, ...form }]);
    setForm({ nombre: "", dni: "", medicoId: MOCK_MEDICOS[0]?.id || "" });
    setShowForm(false);
  };

  const handleRemove = (id) => setPacientes((prev) => prev.filter((p) => p.id !== id));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">Designá o quitá el acceso de pacientes a la plataforma.</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setShowForm((v) => !v)}>
          <IconPlus size={16} /> Designar paciente
        </button>
      </div>

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
            value={form.medicoId}
            onChange={(e) => setForm((f) => ({ ...f, medicoId: e.target.value }))}
          >
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
                <td>{medicoNombre(p.medicoId)}</td>
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
