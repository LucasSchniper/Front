/**
 * Asignaciones paciente -> medico.
 *
 * El backend todavia no tiene ni tabla de asignaciones ni rol admin, asi que
 * por ahora esto vive en localStorage. La UI no sabe de donde salen los datos:
 * cuando exista el endpoint alcanza con reemplazar el cuerpo de estas cuatro
 * funciones por llamadas a `api.asignaciones.*` y devolver promesas.
 *
 * Contrato sugerido para el back:
 *   GET    /api/asignaciones              -> { ok, asignaciones: [{ pacienteId, medicoId }] }
 *   PUT    /api/pacientes/:id/medico      -> body { medicoId } | { medicoId: null }
 */

const KEY = "deca_asignaciones";

const SIN_ASIGNAR = "";

function leerCrudo() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function guardarCrudo(mapa) {
  try {
    localStorage.setItem(KEY, JSON.stringify(mapa));
  } catch {}
}

/**
 * Devuelve el mapa { pacienteId: medicoId }. Si todavia no hay nada guardado,
 * lo siembra con las asignaciones que ya traigan los pacientes.
 */
export function leerAsignaciones(pacientes = []) {
  const guardado = leerCrudo();
  if (guardado) return guardado;

  const inicial = {};
  for (const p of pacientes) {
    if (p.medicoId) inicial[p.id] = p.medicoId;
  }
  guardarCrudo(inicial);
  return inicial;
}

/** Asigna (o reasigna) el medico de un paciente. `medicoId` vacio = sin asignar. */
export function asignarMedico(mapa, pacienteId, medicoId) {
  const siguiente = { ...mapa };
  if (medicoId === SIN_ASIGNAR || medicoId == null) delete siguiente[pacienteId];
  else siguiente[pacienteId] = medicoId;
  guardarCrudo(siguiente);
  return siguiente;
}

/** Saca al paciente del mapa por completo (cuando se lo elimina del padron). */
export function olvidarPaciente(mapa, pacienteId) {
  const siguiente = { ...mapa };
  delete siguiente[pacienteId];
  guardarCrudo(siguiente);
  return siguiente;
}

export { SIN_ASIGNAR };
