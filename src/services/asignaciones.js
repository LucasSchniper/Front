

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

export function asignarMedico(mapa, pacienteId, medicoId) {
  const siguiente = { ...mapa };
  if (medicoId === SIN_ASIGNAR || medicoId == null) delete siguiente[pacienteId];
  else siguiente[pacienteId] = medicoId;
  guardarCrudo(siguiente);
  return siguiente;
}


export function olvidarPaciente(mapa, pacienteId) {
  const siguiente = { ...mapa };
  delete siguiente[pacienteId];
  guardarCrudo(siguiente);
  return siguiente;
}

export { SIN_ASIGNAR };
