import { useMemo, useState } from "react";
import { MOCK_MEDICOS } from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";
import { IconCheck, IconClose, IconPlus, IconShield, IconTrash } from "../../components/icons/Icons";
import { sanitizeField } from "../../utils/signupValidation";

function AdminMedicos() {
  const { users, solicitudesPendientes, aprobarMedico, rechazarMedico } = useAuth();
  const [designados, setDesignados] = useState(MOCK_MEDICOS);
  const [quitados, setQuitados] = useState([]);
  const [form, setForm] = useState({ nombre: "", email: "", dni: "", matricula: "" });
  const [showForm, setShowForm] = useState(false);

  const medicos = useMemo(() => {
    const registrados = users
      .filter((u) => u.role === "medico" && u.estado === "aprobado")
      .map((u) => ({
        id: `u-${u.email}`,
        nombre: `${u.nombre} ${u.apellido || ""}`.trim(),
        email: u.email,
        dni: u.dni,
        matricula: u.matricula,
      }));

    const vistos = new Set();
    return [...designados, ...registrados].filter((m) => {
      const email = m.email.toLowerCase();
      if (vistos.has(email) || quitados.includes(email)) return false;
      vistos.add(email);
      return true;
    });
  }, [users, designados, quitados]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.dni) return;
    setDesignados((prev) => [...prev, { id: `m${Date.now()}`, ...form }]);
    setForm({ nombre: "", email: "", dni: "", matricula: "" });
    setShowForm(false);
  };

  const handleRemove = (email) => setQuitados((prev) => [...prev, email.toLowerCase()]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Médicos</h1>
          <p className="page-subtitle">Designá o quitá acceso a profesionales médicos.</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setShowForm((v) => !v)}>
          <IconPlus size={16} /> Designar médico
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
            type="email"
            placeholder="Mail"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="DNI"
            value={form.dni}
            onChange={(e) => setForm((f) => ({ ...f, dni: sanitizeField("dni", e.target.value) }))}
            required
          />
          <input
            placeholder="Matrícula"
            value={form.matricula}
            onChange={(e) => setForm((f) => ({ ...f, matricula: e.target.value }))}
          />
          <button type="submit" className="btn btn--primary btn--sm">
            Guardar
          </button>
        </form>
      )}

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
                  <button className="btn btn--primary btn--sm" onClick={() => aprobarMedico(s.id)}>
                    <IconCheck size={16} /> Aprobar
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => rechazarMedico(s.id)}>
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
              <th>DNI</th>
              <th>Matrícula</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {medicos.map((m) => (
              <tr key={m.id}>
                <td>{m.nombre}</td>
                <td>{m.email}</td>
                <td>{m.dni || "—"}</td>
                <td>{m.matricula || "—"}</td>
                <td>
                  <button
                    className="icon-btn icon-btn--danger"
                    aria-label={`Eliminar a ${m.nombre}`}
                    onClick={() => handleRemove(m.email)}
                  >
                    <IconTrash size={17} />
                  </button>
                </td>
              </tr>
            ))}
            {medicos.length === 0 && (
              <tr>
                <td colSpan={5} className="data-table__empty">
                  Todavía no hay médicos designados.
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
