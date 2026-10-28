import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { mensajeDeError } from "../../utils/errors";
import type { Analisis, Paciente } from "../../types";
import { IconCalendar, IconChevronRight, IconPatient, IconSearch } from "../../components/icons/Icons";
import RevisarAnalisis from "../../components/RevisarAnalisis";
import { bandaDe } from "../../utils/banda";

function fechaHora(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { fecha: iso, hora: "" };
  return {
    fecha: d.toLocaleDateString("es-AR"),
    hora: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function MedicoPacientes() {
  const [todos, setTodos] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Paciente["id"] | null>(null);
  const [analisisPorPaciente, setAnalisisPorPaciente] = useState<
    Record<string, Analisis[]>
  >({});
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);

  useEffect(() => {
    let cancelado = false;
    api.usuarios
      .listar()
      .then((data) => {
        if (!cancelado) setTodos(data.pacientes || []);
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err));
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const pacientes = todos;

  const [query, setQuery] = useState("");
  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido} ${p.dni ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const actualizarAnalisis = (pacienteId: Paciente["id"], actualizado: Analisis) =>
    setAnalisisPorPaciente((prev) => ({
      ...prev,
      [pacienteId]: (prev[pacienteId] || []).map((a) => (a.id === actualizado.id ? actualizado : a)),
    }));

  const quitarAnalisis = (pacienteId: Paciente["id"], eliminado: Analisis) =>
    setAnalisisPorPaciente((prev) => ({
      ...prev,
      [pacienteId]: (prev[pacienteId] || []).filter((a) => a.id !== eliminado.id),
    }));

  const toggle = (id: Paciente["id"]) => {
    const abrir = expanded !== id;
    setExpanded(abrir ? id : null);
    if (abrir && !analisisPorPaciente[id]) {
      setCargandoAnalisis(true);
      api.analisis
        .listarDePaciente(id)
        .then((data) => setAnalisisPorPaciente((prev) => ({ ...prev, [id]: data.analisis })))
        .catch((err: unknown) => setError(mensajeDeError(err)))
        .finally(() => setCargandoAnalisis(false));
    }
  };

  return (
    <div>
      <h1 className="page-title">Pacientes</h1>
      <p className="page-subtitle">Los pacientes que tenés asignados y sus análisis.</p>

      {loading && <p className="empty-state">Cargando…</p>}
      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
      {!loading && pacientes.length === 0 && (
        <p className="empty-state">
          Todavía no tenés pacientes asignados. El administrador es quien te asigna cada caso.
        </p>
      )}

      {pacientes.length > 0 && (
        <label className="dash-search dash-search--page">
          <IconSearch size={16} />
          <input
            type="search"
            placeholder="Buscar pacientes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      )}
      {pacientes.length > 0 && pacientesFiltrados.length === 0 && (
        <p className="empty-state">Sin pacientes que coincidan.</p>
      )}

      {pacientesFiltrados.length > 0 && (
        <div className="mis-analisis mis-analisis--pacientes">
          {pacientesFiltrados.map((p) => {
            const isOpen = expanded === p.id;
            const analisis = analisisPorPaciente[p.id] || [];
            return (
              <div className="mis-analisis__row mis-analisis__row--paciente" key={p.id}>
                <span className="mis-analisis__fecha">
                  <span className="mis-analisis__avatar" aria-hidden="true">
                    <IconPatient size={16} />
                  </span>
                  <span>
                    <span className="mis-analisis__nombre">
                      {p.nombre} {p.apellido}
                    </span>
                    <span className="mis-analisis__dni">DNI {p.dni}</span>
                  </span>
                </span>
                <button
                  type="button"
                  className={`mis-analisis__toggle${isOpen ? " mis-analisis__toggle--abierto" : ""}`}
                  onClick={() => toggle(p.id)}
                  aria-expanded={isOpen}
                  aria-controls={`analisis-${p.id}`}
                  aria-label={isOpen ? "Ocultar análisis del paciente" : "Ver análisis del paciente"}
                >
                  <IconChevronRight size={18} />
                </button>

                {isOpen && (
                  <div className="mis-analisis__detalle mis-analisis__detalle--lista" id={`analisis-${p.id}`}>
                    {cargandoAnalisis && !analisisPorPaciente[p.id] && (
                      <p className="empty-state">Cargando análisis…</p>
                    )}
                    {analisisPorPaciente[p.id] && analisis.length === 0 && (
                      <p className="empty-state">Sin análisis todavía.</p>
                    )}
                    {analisis.length > 0 && (
                      <div className="mis-analisis__analisis mis-analisis__analisis--head">
                        <span>Fecha</span>
                        <span>Horario</span>
                        <span className="mis-analisis__result-head" title="Percentil de riesgo">
                          Resultado
                        </span>
                      </div>
                    )}
                    {analisis.map((a) => {
                      const banda = bandaDe(a);
                      const { fecha, hora } = fechaHora(a.fecha_hora_entrega);
                      const percentil = Math.round(Number(a.porcentaje));
                      const relleno = Math.min(100, Math.max(0, percentil));
                      return (
                        <div className="mis-analisis__analisis" key={a.id}>
                          <span className="mis-analisis__fecha">
                            <span className="mis-analisis__avatar" aria-hidden="true">
                              <IconCalendar size={16} />
                            </span>
                            {fecha}
                          </span>
                          <span className="mis-analisis__hora">{hora}</span>
                          <span className="mis-analisis__bar" aria-hidden="true">
                            <span className="mis-analisis__bar-fill" style={{ width: `${relleno}%` }} />
                          </span>
                          <span className="mis-analisis__valor" title="Percentil de riesgo">
                            {percentil}%
                          </span>
                          <div className="mis-analisis__info">
                            <span className={`badge badge--${banda.clase}`}>{banda.etiqueta}</span>
                            {a.texto_banda && <p className="mis-analisis__detalle-texto">{a.texto_banda}</p>}
                            <div className="analysis-row__acciones">
                              <RevisarAnalisis
                                analisis={a}
                                onActualizado={(actualizado) => actualizarAnalisis(p.id, actualizado)}
                                onEliminado={(eliminado) => quitarAnalisis(p.id, eliminado)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MedicoPacientes;
