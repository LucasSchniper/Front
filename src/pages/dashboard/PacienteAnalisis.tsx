import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { mensajeDeError } from "../../utils/errors";
import type { Analisis } from "../../types";
import { ADVERTENCIA_TAMIZAJE, bandaDe } from "../../utils/banda";

function fechaHora(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { fecha: iso, hora: "" };
  return {
    fecha: d.toLocaleDateString("es-AR"),
    hora: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  };
}

/**
 * Patient results: a table of fecha / hora / resultado, where the resultado
 * is the model's band followed by the risk percentile.
 */
function PacienteAnalisis() {
  const [analisis, setAnalisis] = useState<Analisis[]>([]);
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
        if (!cancelado) setError(mensajeDeError(err));
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
            <span className="analysis-table__result-head">Resultado · percentil de riesgo</span>
          </div>
          {analisis.map((a) => {
            const banda = bandaDe(a);
            const { fecha, hora } = fechaHora(a.fecha_hora_entrega);
            return (
              <div className="results-table__row analysis-table__row" key={a.id}>
                <span className="analysis-table__date">{fecha}</span>
                <span className="analysis-table__time">{hora}</span>
                <span title={a.texto_banda ?? undefined}>
                  <span className={`badge badge--${banda.clase}`}>{banda.etiqueta}</span>
                  {a.texto_banda && <span className="analisis-banda__texto">{a.texto_banda}</span>}
                </span>
                <span className="analysis-table__value" title="Percentil de riesgo">
                  {Math.round(Number(a.porcentaje))}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {analisis.length > 0 && <p className="analisis-banda__texto">{ADVERTENCIA_TAMIZAJE}</p>}
    </div>
  );
}

export default PacienteAnalisis;
