import { useState } from "react";
import { api, ApiError } from "../services/api";
import { mensajeDeError } from "../utils/errors";
import { IconCheck, IconSend } from "./icons/Icons";
import type { Analisis } from "../types";

interface EnviarAnalisisProps {
  analisis: Analisis;
  onEnviado: (analisis: Analisis) => void;
}

/**
 * Los análisis se guardan sin enviar: el paciente no los ve hasta que el
 * médico toca "Enviar". Si ya estaba enviado muestra la marca.
 */
function EnviarAnalisis({ analisis, onEnviado }: EnviarAnalisisProps) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  if (analisis.enviado !== false) {
    return (
      <span className="envio-chip envio-chip--enviado">
        <IconCheck size={13} /> Enviado
      </span>
    );
  }

  const handleEnviar = async () => {
    setError("");
    setEnviando(true);
    try {
      const { analisis: actualizado } = await api.analisis.enviar(analisis.id);
      onEnviado(actualizado);
    } catch (err) {
      // 409: otra pestaña ya lo envió, así que lo mostramos como enviado.
      if (err instanceof ApiError && err.status === 409) onEnviado({ ...analisis, enviado: true });
      else setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <span className="envio-accion">
      <button
        type="button"
        className="btn btn--primary btn--sm"
        disabled={enviando}
        onClick={handleEnviar}
      >
        <IconSend size={14} /> {enviando ? "Enviando…" : "Enviar al paciente"}
      </button>
      {error && <span className="envio-accion__error">{error}</span>}
    </span>
  );
}

export default EnviarAnalisis;
