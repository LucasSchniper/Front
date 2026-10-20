import { useEffect, useState } from "react";
import { api } from "../services/api";
import { mensajeDeError } from "../utils/errors";
import type { Paciente, Turno } from "../types";

interface TurnosPacienteProps {
  pacienteId: Paciente["id"];
}

function fechaCorta(fechaHora: string) {
  const [y, m, d] = fechaHora.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function ahoraLocal() {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 16);
}

function TurnosPaciente({ pacienteId }: TurnosPacienteProps) {
  const [turnos, setTurnos] = useState<Turno[] | null>(null);
  const [fechaHora, setFechaHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [editando, setEditando] = useState<Turno | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    api.turnos
      .listar({ pacienteId })
      .then((data) => {
        if (!cancelado) setTurnos(data.turnos);
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err));
      });
    return () => {
      cancelado = true;
    };
  }, [pacienteId]);

  const ordenar = (lista: Turno[]) => [...lista].sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora));

  const limpiarFormulario = () => {
    setEditando(null);
    setFechaHora("");
    setMotivo("");
  };

  const ejecutar = async (accion: () => Promise<void>) => {
    setError("");
    setCargando(true);
    try {
      await accion();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = () => {
    if (!fechaHora) return setError("Elegí la fecha y hora del turno.");
    ejecutar(async () => {
      const motivoLimpio = motivo.trim() || undefined;
      if (editando) {
        const { turno } = await api.turnos.reprogramar(editando.id, fechaHora, motivoLimpio);
        setTurnos((prev) => ordenar((prev || []).map((t) => (t.id === turno.id ? turno : t))));
      } else {
        const { turno } = await api.turnos.crear({ pacienteId, fechaHora, motivo: motivoLimpio });
        setTurnos((prev) => ordenar([...(prev || []), turno]));
      }
      limpiarFormulario();
    });
  };

  const handleEditar = (turno: Turno) => {
    setError("");
    setEditando(turno);
    setFechaHora(turno.fecha_hora.slice(0, 16));
    setMotivo(turno.motivo || "");
  };

  const descartar = (turno: Turno, accion: (id: Turno["id"]) => Promise<unknown>) =>
    ejecutar(async () => {
      await accion(turno.id);
      setTurnos((prev) => (prev || []).filter((t) => t.id !== turno.id));
      if (editando?.id === turno.id) limpiarFormulario();
    });

  return (
    <div className="turnos-paciente">
      <p className="analysis-row__summary">Turnos</p>

      {turnos === null && !error && <p className="empty-state">Cargando turnos…</p>}
      {turnos?.length === 0 && <p className="empty-state">Sin turnos pendientes.</p>}
      {turnos?.map((t) => (
        <div className="analysis-row analysis-row--card" key={t.id}>
          <div>
            <p className="analysis-row__summary">
              {fechaCorta(t.fecha_hora)} · {t.fecha_hora.slice(11, 16)}hs
            </p>
            {t.motivo && <p className="analysis-row__meta">{t.motivo}</p>}
          </div>
          <div className="analysis-row__acciones">
            <button type="button" className="btn btn--ghost btn--sm" disabled={cargando} onClick={() => handleEditar(t)}>
              Cambiar fecha
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={cargando}
              onClick={() => descartar(t, api.turnos.cancelar)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={cargando}
              onClick={() => descartar(t, api.turnos.marcarRealizado)}
            >
              Realizado
            </button>
          </div>
        </div>
      ))}

      <div className="turnos-paciente__form">
        <div className="form-field">
          <label htmlFor={`turno-fecha-${pacienteId}`}>
            {editando ? `Nueva fecha para el turno del ${fechaCorta(editando.fecha_hora)}` : "Fecha y hora"}
          </label>
          <input
            id={`turno-fecha-${pacienteId}`}
            type="datetime-local"
            min={ahoraLocal()}
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor={`turno-motivo-${pacienteId}`}>Motivo (opcional)</label>
          <input
            id={`turno-motivo-${pacienteId}`}
            type="text"
            maxLength={200}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
        <div className="analysis-row__acciones">
          {editando && (
            <button type="button" className="btn btn--ghost btn--sm" disabled={cargando} onClick={limpiarFormulario}>
              Descartar cambios
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={cargando || !fechaHora}
            onClick={handleGuardar}
          >
            {editando ? "Guardar nueva fecha" : "Asignar turno"}
          </button>
        </div>
      </div>

      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
    </div>
  );
}

export default TurnosPaciente;
