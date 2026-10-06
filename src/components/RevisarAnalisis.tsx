import { useState } from "react";
import { api, ApiError } from "../services/api";
import { mensajeDeError } from "../utils/errors";
import { IconCheck, IconClose, IconSend, IconTrash } from "./icons/Icons";
import type { Analisis } from "../types";

interface RevisarAnalisisProps {
  analisis: Analisis;
  onActualizado: (analisis: Analisis) => void;
  onEliminado: (analisis: Analisis) => void;
}

function RevisarAnalisis({ analisis, onActualizado, onEliminado }: RevisarAnalisisProps) {
  const [cargando, setCargando] = useState(false);
  const [confirmarRechazo, setConfirmarRechazo] = useState(false);
  const [error, setError] = useState("");

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

  if (analisis.enviado !== false) {
    return (
      <span className="envio-chip envio-chip--enviado">
        <IconCheck size={13} /> Enviado
      </span>
    );
  }

  if (analisis.aprobado === false) {
    const handleAprobar = () =>
      ejecutar(async () => {
        try {
          const { analisis: actualizado } = await api.analisis.aprobar(analisis.id);
          onActualizado(actualizado);
        } catch (err) {
          if (err instanceof ApiError && err.status === 409) onActualizado({ ...analisis, aprobado: true });
          else throw err;
        }
      });

    const handleRechazar = () =>
      ejecutar(async () => {
        await api.analisis.rechazar(analisis.id);
        onEliminado(analisis);
      });

    if (confirmarRechazo) {
      return (
        <span className="envio-accion">
          <span className="envio-accion__pregunta">¿Rechazar? El análisis se va a eliminar.</span>
          <span className="envio-accion__botones">
            <button
              type="button"
              className="btn btn--danger btn--sm"
              disabled={cargando}
              onClick={handleRechazar}
            >
              <IconTrash size={14} /> {cargando ? "Eliminando…" : "Sí, eliminar"}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={cargando}
              onClick={() => setConfirmarRechazo(false)}
            >
              Cancelar
            </button>
          </span>
          {error && <span className="envio-accion__error">{error}</span>}
        </span>
      );
    }

    return (
      <span className="envio-accion">
        <span className="envio-accion__pregunta">¿Aprobás el resultado de la IA?</span>
        <span className="envio-accion__botones">
          <button type="button" className="btn btn--primary btn--sm" disabled={cargando} onClick={handleAprobar}>
            <IconCheck size={14} /> {cargando ? "Aprobando…" : "Aprobar"}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={cargando}
            onClick={() => setConfirmarRechazo(true)}
          >
            <IconClose size={14} /> Rechazar
          </button>
        </span>
        {error && <span className="envio-accion__error">{error}</span>}
      </span>
    );
  }

  const handleEnviar = () =>
    ejecutar(async () => {
      try {
        const { analisis: actualizado } = await api.analisis.enviar(analisis.id);
        onActualizado(actualizado);
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) onActualizado({ ...analisis, enviado: true });
        else throw err;
      }
    });

  return (
    <span className="envio-accion">
      <span className="envio-chip envio-chip--aprobado">
        <IconCheck size={13} /> Aprobado
      </span>
      <button type="button" className="btn btn--primary btn--sm" disabled={cargando} onClick={handleEnviar}>
        <IconSend size={14} /> {cargando ? "Enviando…" : "Enviar al paciente"}
      </button>
      {error && <span className="envio-accion__error">{error}</span>}
    </span>
  );
}

export default RevisarAnalisis;
