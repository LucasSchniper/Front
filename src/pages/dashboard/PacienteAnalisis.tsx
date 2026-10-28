import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { mensajeDeError } from "../../utils/errors";
import type { Analisis } from "../../types";
import { ADVERTENCIA_TAMIZAJE, bandaDe } from "../../utils/banda";
import { IconCalendar, IconChevronRight } from "../../components/icons/Icons";

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
  const [abiertoId, setAbiertoId] = useState<Analisis["id"] | null>(null);

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
        <div className="mis-analisis mis-analisis--propios">
          <div className="mis-analisis__row mis-analisis__row--head">
            <span>Fecha</span>
            <span>Horario</span>
            <span className="mis-analisis__result-head" title="Percentil de riesgo">
              Resultado
            </span>
          </div>
          {analisis.map((a) => {
            const banda = bandaDe(a);
            const { fecha, hora } = fechaHora(a.fecha_hora_entrega);
            const percentil = Math.round(Number(a.porcentaje));
            const relleno = Math.min(100, Math.max(0, percentil));
            const abierto = abiertoId === a.id;
            return (
              <div className="mis-analisis__row" key={a.id}>
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
                <button
                  type="button"
                  className={`mis-analisis__toggle${abierto ? " mis-analisis__toggle--abierto" : ""}`}
                  onClick={() => setAbiertoId(abierto ? null : a.id)}
                  aria-expanded={abierto}
                  aria-controls={`detalle-${a.id}`}
                  aria-label={abierto ? "Ocultar detalle del resultado" : "Ver detalle del resultado"}
                >
                  <IconChevronRight size={18} />
                </button>
                {abierto && (
                  <div className="mis-analisis__detalle" id={`detalle-${a.id}`}>
                    <span className={`badge badge--${banda.clase}`}>{banda.etiqueta}</span>
                    {a.texto_banda && <p className="mis-analisis__detalle-texto">{a.texto_banda}</p>}
                  </div>
                )}
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
