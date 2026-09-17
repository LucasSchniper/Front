import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { mensajeDeError } from "../../utils/errors";
import type { Analisis, Paciente } from "../../types";

type Estado = "positivo" | "seguimiento" | "negativo";

function estadoDe(resultado: number): Estado {
  if (resultado >= 70) return "positivo";
  if (resultado >= 30) return "seguimiento";
  return "negativo";
}

const ESTADO_LABEL: Record<Estado, string> = {
  negativo: "Sin hallazgos",
  positivo: "Sugestivo",
  seguimiento: "En seguimiento",
};

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

  // El backend ya devuelve solo los pacientes asignados a este médico.
  const pacientes = todos;

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

      <div className="patient-list">
        {pacientes.map((p) => {
          const isOpen = expanded === p.id;
          const analisis = analisisPorPaciente[p.id] || [];
          return (
            <div className="patient-card" key={p.id}>
              <button className="patient-card__header" onClick={() => toggle(p.id)}>
                <div>
                  <p className="patient-card__name">
                    {p.nombre} {p.apellido}
                  </p>
                  <p className="patient-card__meta">DNI {p.dni}</p>
                </div>
                <span className="patient-card__toggle">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="patient-card__body">
                  {cargandoAnalisis && !analisisPorPaciente[p.id] && (
                    <p className="empty-state">Cargando análisis…</p>
                  )}
                  {analisisPorPaciente[p.id] && analisis.length === 0 && (
                    <p className="empty-state">Sin análisis todavía.</p>
                  )}
                  {analisis.map((a) => {
                    const resultado = Number(a.porcentaje);
                    const estado = estadoDe(resultado);
                    const { fecha, hora } = fechaHora(a.fecha_hora_entrega);
                    return (
                      <div className="analysis-row" key={a.id}>
                        <div>
                          <p className="analysis-row__summary">{resultado}% de posibilidad</p>
                          <p className="analysis-row__meta">
                            {fecha} · {hora}
                          </p>
                        </div>
                        <span className={`badge badge--${estado}`}>{ESTADO_LABEL[estado]}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MedicoPacientes;
