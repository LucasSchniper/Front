import type { Paciente } from "../types";

const KEY = "deca_asignaciones";

const SIN_ASIGNAR = "";

/** Mapa `pacienteId -> medicoId`, tal como lo guarda localStorage. */
export type MapaAsignaciones = Record<string, string | number>;

type PacienteAsignable = Pick<Paciente, "id"> & { medicoId?: Paciente["medico_id"] };

function leerCrudo(): MapaAsignaciones | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MapaAsignaciones) : null;
  } catch {
    return null;
  }
}

function guardarCrudo(mapa: MapaAsignaciones): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(mapa));
  } catch {}
}


export function leerAsignaciones(pacientes: PacienteAsignable[] = []): MapaAsignaciones {
  const guardado = leerCrudo();
  if (guardado) return guardado;

  const inicial: MapaAsignaciones = {};
  for (const p of pacientes) {
    if (p.medicoId) inicial[p.id] = p.medicoId;
  }
  guardarCrudo(inicial);
  return inicial;
}

export function asignarMedico(
  mapa: MapaAsignaciones,
  pacienteId: string | number,
  medicoId: string | number | null | undefined
): MapaAsignaciones {
  const siguiente = { ...mapa };
  if (medicoId === SIN_ASIGNAR || medicoId == null) delete siguiente[pacienteId];
  else siguiente[pacienteId] = medicoId;
  guardarCrudo(siguiente);
  return siguiente;
}


export function olvidarPaciente(
  mapa: MapaAsignaciones,
  pacienteId: string | number
): MapaAsignaciones {
  const siguiente = { ...mapa };
  delete siguiente[pacienteId];
  guardarCrudo(siguiente);
  return siguiente;
}

export { SIN_ASIGNAR };
