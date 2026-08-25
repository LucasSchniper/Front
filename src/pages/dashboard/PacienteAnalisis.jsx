import { useEffect, useState } from "react";
import { api } from "../../services/api";

function estadoDe(resultado) {
  if (resultado >= 70) return "positivo";
  if (resultado >= 30) return "seguimiento";
  return "negativo";
}

const ESTADO_LABEL = {
  negativo: "Sin hallazgos",
  positivo: "Sugestivo",
  seguimiento: "En seguimiento",
};

function fechaHora(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { fecha: iso, hora: "" };
  return {
    fecha: d.toLocaleDateString("es-AR"),
    hora: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  };
}

/**
 * Patient results, following the "Mis analisis" reference: a table of
 * fecha / hora / resultado, where the resultado is a bar with the model's
 * confidence percentage.
 */
function PacienteAnalisis() {
  const [analisis, setAnalisis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    api.analisis
      .listarPropios()
      .then((data) => {
        if (!cancelado) setAnalisis(data.analisis);
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

  return (
    <div>
      <h1 className="page-title">Mis análisis</h1>
      <p className="page-subtitle">Historial de electrocardiogramas analizados por tu médico.</p>

      {loading && <p className="empty-state">Cargando…</p>}
      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
      {!loading && analisis.length === 0 && (
        <p className="empty-state">Todavía no tenés análisis cargados.</p>
      )}

      {analisis.length > 0 && (
        <div className="results-table analysis-table">
          <div className="results-table__row analysis-table__row results-table__row--head">
            <span>Fecha</span>
            <span>Hora</span>
            <span className="analysis-table__result-head">Resultado</span>
          </div>
          {analisis.map((a) => {
            const resultado = Number(a.porcentaje);
            const estado = estadoDe(resultado);
            const { fecha, hora } = fechaHora(a.fecha_hora_entrega);
            return (
              <div className="results-table__row analysis-table__row" key={a.id}>
                <span className="analysis-table__date">{fecha}</span>
                <span className="analysis-table__time">{hora}</span>
                <span
                  className="result-bar"
                  role="img"
                  aria-label={`${resultado}% · ${ESTADO_LABEL[estado]}`}
                  title={ESTADO_LABEL[estado]}
                >
                  <span className="result-bar__fill" style={{ width: `${resultado}%` }} />
                </span>
                <span className="analysis-table__value">{resultado}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PacienteAnalisis;
