import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";
import { mensajeDeError } from "../../utils/errors";
import { IconChevronRight, IconPlus } from "../../components/icons/Icons";
import type { Paciente, Turno } from "../../types";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/** Horarios cada media hora, de 07:00 a 21:00. */
const HORAS = Array.from({ length: 29 }, (_, i) => {
  const minutos = 7 * 60 + i * 30;
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
});

const pad = (n: number) => String(n).padStart(2, "0");
const diasDelMes = (anio: number, mes: number) => new Date(anio, mes + 1, 0).getDate();
const claveDia = (anio: number, mes: number, dia: number) => `${anio}-${pad(mes + 1)}-${pad(dia)}`;

interface Celda {
  dia: number;
  /** false para los días del mes siguiente que completan la última fila. */
  delMes: boolean;
}

/** Semanas de lunes a domingo: huecos vacíos al principio y el mes siguiente al final. */
function armarSemanas(anio: number, mes: number): (Celda | null)[][] {
  const offset = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const celdas: (Celda | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= diasDelMes(anio, mes); d++) celdas.push({ dia: d, delMes: true });
  for (let d = 1; celdas.length % 7 !== 0; d++) celdas.push({ dia: d, delMes: false });
  const semanas = [];
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
  return semanas;
}

interface Formulario {
  pacienteId: string;
  mes: number;
  dia: number;
  hora: string;
  lugar: string;
}

function MedicoTurnos() {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth());

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [turnos, setTurnos] = useState<Turno[] | null>(null);

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Turno | null>(null);
  const [form, setForm] = useState<Formulario>({
    pacienteId: "",
    mes: hoy.getMonth(),
    dia: hoy.getDate(),
    hora: "10:00",
    lugar: "",
  });
  const [seleccionado, setSeleccionado] = useState<Turno | null>(null);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelado = false;
    api.usuarios
      .listar()
      .then((data) => {
        if (cancelado) return;
        setPacientes(data.pacientes || []);
        setForm((f) => ({ ...f, pacienteId: f.pacienteId || String(data.pacientes[0]?.id ?? "") }));
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
    api.turnos
      .listar({ estado: "todos" })
      .then((data) => {
        if (!cancelado) setTurnos(data.turnos);
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err));
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Cierra el desplegable al hacer click afuera o con Escape.
  useEffect(() => {
    if (!formAbierto && !seleccionado) return;
    const cerrar = () => {
      setFormAbierto(false);
      setSeleccionado(null);
    };
    const alClickear = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) cerrar();
    };
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    document.addEventListener("mousedown", alClickear);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("mousedown", alClickear);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [formAbierto, seleccionado]);

  const nombrePaciente = (t: Turno) => {
    if (t.paciente_nombre) return `${t.paciente_nombre} ${t.paciente_apellido ?? ""}`.trim();
    const p = pacientes.find((x) => String(x.id) === String(t.paciente_id));
    return p ? `${p.nombre} ${p.apellido}` : "—";
  };

  const turnosPorDia = new Map<string, Turno[]>();
  for (const t of turnos || []) {
    if (t.estado === "cancelado") continue;
    const clave = t.fecha_hora.slice(0, 10);
    turnosPorDia.set(clave, [...(turnosPorDia.get(clave) || []), t]);
  }
  for (const lista of turnosPorDia.values()) lista.sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora));

  const moverMes = (delta: number) => {
    const fecha = new Date(anio, mes + delta, 1);
    setAnio(fecha.getFullYear());
    setMes(fecha.getMonth());
  };

  /** El año del turno es el del calendario; si ese mes ya pasó, va al año siguiente. */
  const anioDelTurno = (mesTurno: number) =>
    anio === hoy.getFullYear() && mesTurno < hoy.getMonth() ? anio + 1 : anio;

  const abrirNuevo = (dia?: number) => {
    setError("");
    setAviso("");
    setSeleccionado(null);
    setEditando(null);
    setForm((f) => ({ ...f, mes, dia: dia ?? (mes === hoy.getMonth() ? hoy.getDate() : 1), lugar: "" }));
    setFormAbierto(true);
  };

  const abrirEdicion = (turno: Turno) => {
    setSeleccionado(null);
    setEditando(turno);
    setForm((f) => ({
      ...f,
      mes: Number(turno.fecha_hora.slice(5, 7)) - 1,
      dia: Number(turno.fecha_hora.slice(8, 10)),
      hora: turno.fecha_hora.slice(11, 16),
      lugar: turno.motivo || "",
    }));
    setFormAbierto(true);
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
    setTurnos((prev) => [...(prev || []).filter((t) => t.id !== turno.id), turno]);

  const handleGuardar = () => {
    if (!editando && !form.pacienteId) return setError("Elegí un paciente.");
    const anioTurno = anioDelTurno(form.mes);
    const dia = Math.min(form.dia, diasDelMes(anioTurno, form.mes));
    const fechaHora = `${claveDia(anioTurno, form.mes, dia)}T${form.hora}`;
    if (new Date(fechaHora) < new Date()) return setError("Elegí una fecha que no haya pasado.");

    ejecutar(async () => {
      const motivo = form.lugar.trim() || undefined;
      if (editando) {
        const { turno } = await api.turnos.reprogramar(editando.id, fechaHora, motivo);
        reemplazar({ ...editando, ...turno });
        setAviso("Turno reprogramado. Le avisamos al paciente.");
      } else {
        const { turno } = await api.turnos.crear({ pacienteId: form.pacienteId, fechaHora, motivo });
        reemplazar(turno);
        setAviso("Turno asignado. Le avisamos al paciente.");
      }
      setFormAbierto(false);
      setEditando(null);
      setAnio(anioTurno);
      setMes(form.mes);
    });
  };

  const cambiarEstado = (turno: Turno, accion: (id: Turno["id"]) => Promise<{ turno: Turno }>) =>
    ejecutar(async () => {
      const { turno: actualizado } = await accion(turno.id);
      reemplazar({ ...turno, ...actualizado });
      setSeleccionado(null);
    });

  const semanas = armarSemanas(anio, mes);
  const anioForm = anioDelTurno(form.mes);
  const esHoy = (dia: number) =>
    anio === hoy.getFullYear() && mes === hoy.getMonth() && dia === hoy.getDate();

  return (
    <div className="turnos-cal">
      <div className="turnos-cal__toolbar" ref={popoverRef}>
        <div className="turnos-cal__mes">
          <button type="button" className="turnos-cal__nav turnos-cal__nav--prev" onClick={() => moverMes(-1)} aria-label="Mes anterior">
            <IconChevronRight size={18} />
          </button>
          <h1 className="turnos-cal__titulo">
            {MESES[mes]} {anio}
          </h1>
          <button type="button" className="turnos-cal__nav" onClick={() => moverMes(1)} aria-label="Mes siguiente">
            <IconChevronRight size={18} />
          </button>
        </div>

        <button
          type="button"
          className="btn btn--primary btn--sm turnos-cal__agregar"
          aria-expanded={formAbierto}
          onClick={() => (formAbierto ? setFormAbierto(false) : abrirNuevo())}
        >
          Añadir turno <IconPlus size={18} />
        </button>

        {formAbierto && (
          <div className="turnos-pop" role="dialog" aria-label={editando ? "Reprogramar turno" : "Añadir turno"}>
            {editando ? (
              <p className="turnos-pop__titulo">Reprogramar a {nombrePaciente(editando)}</p>
            ) : (
              <label className="turnos-pop__fila">
                <span>Paciente</span>
                <select
                  value={form.pacienteId}
                  onChange={(e) => setForm({ ...form, pacienteId: e.target.value })}
                  disabled={pacientes.length === 0}
                >
                  {pacientes.length === 0 && <option value="">Sin pacientes</option>}
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="turnos-pop__fila">
              <span>Mes</span>
              <select value={form.mes} onChange={(e) => setForm({ ...form, mes: Number(e.target.value) })}>
                {MESES.map((nombre, i) => (
                  <option key={nombre} value={i}>
                    {nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="turnos-pop__fila">
              <span>Día</span>
              <select value={form.dia} onChange={(e) => setForm({ ...form, dia: Number(e.target.value) })}>
                {Array.from({ length: diasDelMes(anioForm, form.mes) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
            <label className="turnos-pop__fila">
              <span>Hora</span>
              <select value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })}>
                {!HORAS.includes(form.hora) && <option value={form.hora}>{form.hora}</option>}
                {HORAS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
            <label className="turnos-pop__fila">
              <span>Lugar</span>
              <input
                type="text"
                maxLength={200}
                placeholder="Hospital Italiano"
                value={form.lugar}
                onChange={(e) => setForm({ ...form, lugar: e.target.value })}
              />
            </label>
            <button
              type="button"
              className="btn btn--primary btn--sm turnos-pop__submit"
              disabled={cargando || (!editando && !form.pacienteId)}
              onClick={handleGuardar}
            >
              {editando ? "Guardar fecha" : "Añadir turno"}
            </button>
            {error && <p className="turnos-pop__error">{error}</p>}
          </div>
        )}

        {seleccionado && (
          <div className="turnos-pop" role="dialog" aria-label="Detalle del turno">
            <p className="turnos-pop__titulo">{nombrePaciente(seleccionado)}</p>
            <p className="turnos-pop__detalle">
              {Number(seleccionado.fecha_hora.slice(8, 10))} de {MESES[Number(seleccionado.fecha_hora.slice(5, 7)) - 1]} ·{" "}
              {seleccionado.fecha_hora.slice(11, 16)}hs
            </p>
            {seleccionado.motivo && <p className="turnos-pop__detalle">{seleccionado.motivo}</p>}
            {seleccionado.estado === "pendiente" ? (
              <div className="turnos-pop__acciones">
                <button type="button" className="btn btn--primary btn--sm" disabled={cargando} onClick={() => cambiarEstado(seleccionado, api.turnos.marcarRealizado)}>
                  Realizado
                </button>
                <button type="button" className="btn btn--ghost btn--sm" disabled={cargando} onClick={() => abrirEdicion(seleccionado)}>
                  Cambiar fecha
                </button>
                <button type="button" className="btn btn--ghost btn--sm" disabled={cargando} onClick={() => cambiarEstado(seleccionado, api.turnos.cancelar)}>
                  Cancelar turno
                </button>
              </div>
            ) : (
              <span className="envio-chip">Realizado</span>
            )}
            {error && <p className="turnos-pop__error">{error}</p>}
          </div>
        )}
      </div>

      {aviso && <p className="auth-card__feedback auth-card__feedback--success">{aviso}</p>}
      {error && !formAbierto && !seleccionado && (
        <p className="auth-card__feedback auth-card__feedback--error">{error}</p>
      )}

      <div className="turnos-cal__grilla" role="grid" aria-busy={turnos === null}>
        <div className="turnos-cal__fila turnos-cal__fila--head" role="row">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="turnos-cal__dia-semana" role="columnheader">
              {d}
            </div>
          ))}
        </div>
        {semanas.map((semana, i) => (
          <div key={i} className="turnos-cal__fila" role="row">
            {semana.map((celda, j) => {
              if (!celda) return <div key={j} className="turnos-cal__celda turnos-cal__celda--vacia" role="gridcell" />;
              const delDia = celda.delMes ? turnosPorDia.get(claveDia(anio, mes, celda.dia)) || [] : [];
              return (
                <div
                  key={j}
                  role="gridcell"
                  className={`turnos-cal__celda ${celda.delMes ? "" : "turnos-cal__celda--fuera"} ${
                    celda.delMes && esHoy(celda.dia) ? "turnos-cal__celda--hoy" : ""
                  }`}
                  onDoubleClick={() => celda.delMes && abrirNuevo(celda.dia)}
                >
                  <span className="turnos-cal__numero">{celda.dia}</span>
                  {delDia.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`turnos-cal__turno ${t.estado === "realizado" ? "turnos-cal__turno--realizado" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setError("");
                        setFormAbierto(false);
                        setSeleccionado(t);
                      }}
                    >
                      <strong>{t.fecha_hora.slice(11, 16)}hs</strong> {nombrePaciente(t)}
                      {t.motivo && <span>{t.motivo}</span>}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicoTurnos;
