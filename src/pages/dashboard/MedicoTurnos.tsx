import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { mensajeDeError } from "../../utils/errors";
import type { EstadoTurno, Paciente, Turno } from "../../types";

type FiltroEstado = EstadoTurno | "todos";

const FILTROS: { valor: FiltroEstado; etiqueta: string }[] = [
  { valor: "pendiente", etiqueta: "Pendientes" },
  { valor: "realizado", etiqueta: "Realizados" },
  { valor: "cancelado", etiqueta: "Cancelados" },
  { valor: "todos", etiqueta: "Todos" },
];

const ETIQUETA_ESTADO: Record<EstadoTurno, string> = {
  pendiente: "Pendiente",
  realizado: "Realizado",
  cancelado: "Cancelado",
};

function fechaCorta(fechaHora: string) {
  const [y, m, d] = fechaHora.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function ahoraLocal() {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 16);
}

function MedicoTurnos() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [turnos, setTurnos] = useState<Turno[] | null>(null);
  const [filtro, setFiltro] = useState<FiltroEstado>("pendiente");

  const [pacienteId, setPacienteId] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [editando, setEditando] = useState<Turno | null>(null);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let cancelado = false;
    api.usuarios
      .listar()
      .then((data) => {
        if (cancelado) return;
        setPacientes(data.pacientes || []);
        setPacienteId((actual) => actual || String(data.pacientes[0]?.id ?? ""));
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err));
      });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    setTurnos(null);
    api.turnos
      .listar({ estado: filtro })
      .then((data) => {
        if (!cancelado) setTurnos(data.turnos);
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err));
      });
    return () => {
      cancelado = true;
    };
  }, [filtro]);

  const ordenar = (lista: Turno[]) => [...lista].sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora));

  const nombrePaciente = (t: Turno) => {
    if (t.paciente_nombre) return `${t.paciente_nombre} ${t.paciente_apellido ?? ""}`.trim();
    const p = pacientes.find((x) => String(x.id) === String(t.paciente_id));
    return p ? `${p.nombre} ${p.apellido}` : "—";
  };

  const limpiarFormulario = () => {
    setEditando(null);
    setFechaHora("");
    setMotivo("");
  };

  const ejecutar = async (accion: () => Promise<void>) => {
    setError("");
    setAviso("");
    setCargando(true);
    try {
      await accion();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  const reemplazar = (turno: Turno) =>
    setTurnos((prev) => {
      const lista = (prev || []).filter((t) => t.id !== turno.id);
      return filtro === "todos" || filtro === turno.estado ? ordenar([...lista, turno]) : lista;
    });

  const handleGuardar = () => {
    if (!editando && !pacienteId) return setError("Elegí un paciente.");
    if (!fechaHora) return setError("Elegí la fecha y hora del turno.");
    ejecutar(async () => {
      const motivoLimpio = motivo.trim() || undefined;
      if (editando) {
        const { turno } = await api.turnos.reprogramar(editando.id, fechaHora, motivoLimpio);
        reemplazar({ ...editando, ...turno });
        setAviso("Turno reprogramado. Le avisamos al paciente.");
      } else {
        const { turno } = await api.turnos.crear({ pacienteId, fechaHora, motivo: motivoLimpio });
        reemplazar(turno);
        setAviso("Turno asignado. Le avisamos al paciente.");
      }
      limpiarFormulario();
    });
  };

  const handleEditar = (turno: Turno) => {
    setError("");
    setAviso("");
    setEditando(turno);
    setFechaHora(turno.fecha_hora.slice(0, 16));
    setMotivo(turno.motivo || "");
  };

  const cambiarEstado = (turno: Turno, accion: (id: Turno["id"]) => Promise<{ turno: Turno }>) =>
    ejecutar(async () => {
      const { turno: actualizado } = await accion(turno.id);
      reemplazar({ ...turno, ...actualizado });
      if (editando?.id === turno.id) limpiarFormulario();
    });

  return (
    <div>
      <h1 className="page-title">Turnos</h1>
      <p className="page-subtitle">Asigná turnos a tus pacientes y marcá los que ya se hicieron.</p>

      <div className="dash-card turnos-form">
        <div className="dash-card__header">
          <h2>{editando ? `Reprogramar turno de ${nombrePaciente(editando)}` : "Nuevo turno"}</h2>
        </div>

        <div className="turnos-form__campos">
          {!editando && (
            <div className="form-field">
              <label htmlFor="turno-paciente">Paciente</label>
              <select
                id="turno-paciente"
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                disabled={pacientes.length === 0}
              >
                {pacientes.length === 0 && <option value="">Sin pacientes asignados</option>}
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-field">
            <label htmlFor="turno-fecha">Fecha y hora</label>
            <input
              id="turno-fecha"
              type="datetime-local"
              min={ahoraLocal()}
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="turno-motivo">Motivo (opcional)</label>
            <input
              id="turno-motivo"
              type="text"
              maxLength={200}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
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
            disabled={cargando || !fechaHora || (!editando && !pacienteId)}
            onClick={handleGuardar}
          >
            {editando ? "Guardar nueva fecha" : "Asignar turno"}
          </button>
        </div>

        {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
        {aviso && <p className="auth-card__feedback auth-card__feedback--success">{aviso}</p>}
      </div>

      <div className="turnos-filtro form-field">
        <label htmlFor="turno-filtro">Mostrar</label>
        <select id="turno-filtro" value={filtro} onChange={(e) => setFiltro(e.target.value as FiltroEstado)}>
          {FILTROS.map((f) => (
            <option key={f.valor} value={f.valor}>
              {f.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="patient-list">
        {turnos === null && <p className="empty-state">Cargando turnos…</p>}
        {turnos?.length === 0 && <p className="empty-state">No hay turnos para mostrar.</p>}
        {turnos?.map((t) => (
          <div className="analysis-row analysis-row--card" key={t.id}>
            <div>
              <p className="analysis-row__summary">
                {nombrePaciente(t)} · {fechaCorta(t.fecha_hora)} · {t.fecha_hora.slice(11, 16)}hs
              </p>
              {t.motivo && <p className="analysis-row__meta">{t.motivo}</p>}
            </div>
            <div className="analysis-row__acciones">
              {t.estado === "pendiente" ? (
                <>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    disabled={cargando}
                    onClick={() => handleEditar(t)}
                  >
                    Cambiar fecha
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    disabled={cargando}
                    onClick={() => cambiarEstado(t, api.turnos.cancelar)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    disabled={cargando}
                    onClick={() => cambiarEstado(t, api.turnos.marcarRealizado)}
                  >
                    Realizado
                  </button>
                </>
              ) : (
                <span className="envio-chip">{ETIQUETA_ESTADO[t.estado]}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicoTurnos;
