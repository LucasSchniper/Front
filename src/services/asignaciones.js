/**
 * Asignaciones paciente -> medico.
 *
 * El backend todavia no tiene tabla de asignaciones, asi que por ahora esto
 * vive en localStorage. Las claves y los valores son los ids REALES que
 * devuelve la API (api.usuarios.listar / api.medicos.listar), normalizados a
 * string porque las claves de un objeto JSON siempre son strings.
 *
 * Limitacion conocida: al vivir en el browser, la asignacion que hace el admin
 * solo la ve ese browser. Cuando exista el endpoint alcanza con reemplazar el
 * cuerpo de estas funciones por llamadas a `api.asignaciones.*` y devolver
 * promesas; la UI ya no depende de donde salen los datos.
 *
 * Contrato sugerido para el back:
 *   GET    /asignaciones              -> { ok, asignaciones: [{ pacienteId, medicoId }] }
 *   PUT    /pacientes/:id/medico      -> body { medicoId } | { medicoId: null }
 */

const KEY = "deca_asignaciones";

const SIN_ASIGNAR = "";

/** Los ids pueden venir como number del back y como string del <select>. */
const clave = (id) => (id == null ? "" : String(id));

function leerCrudo() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function guardarCrudo(mapa) {
  try {
    localStorage.setItem(KEY, JSON.stringify(mapa));
  } catch {}
}

/** Devuelve el mapa { pacienteId: medicoId } guardado. */
export function leerAsignaciones() {
  return leerCrudo();
}

/** Asigna (o reasigna) el medico de un paciente. `medicoId` vacio = sin asignar. */
export function asignarMedico(mapa, pacienteId, medicoId) {
  const siguiente = { ...mapa };
  const pid = clave(pacienteId);
  if (medicoId === SIN_ASIGNAR || medicoId == null) delete siguiente[pid];
  else siguiente[pid] = clave(medicoId);
  guardarCrudo(siguiente);
  return siguiente;
}

/** Saca al paciente del mapa por completo (cuando deja de existir). */
export function olvidarPaciente(mapa, pacienteId) {
  const siguiente = { ...mapa };
  delete siguiente[clave(pacienteId)];
  guardarCrudo(siguiente);
  return siguiente;
}

/** Id del medico a cargo de un paciente, o "" si no tiene. */
export function medicoDePaciente(mapa, pacienteId) {
  return mapa[clave(pacienteId)] || SIN_ASIGNAR;
}

/** Filtra una lista de pacientes dejando solo los asignados a ese medico. */
export function pacientesDeMedico(mapa, pacientes, medicoId) {
  const mid = clave(medicoId);
  if (!mid) return [];
  return pacientes.filter((p) => mapa[clave(p.id)] === mid);
}

export { SIN_ASIGNAR };
