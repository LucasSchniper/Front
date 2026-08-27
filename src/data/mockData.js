
export const ROLE_LABEL = {
  administrador: "Administrador",
  medico: "Médico",
  paciente: "Paciente",
};

export const ROLE_COLOR = {
  administrador: "#2f9e5c",
  medico: "#c0687a",
  paciente: "#d9a441",
};

export const OBRAS_SOCIALES = [
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "Medifé",
  "OSECAC",
  "IOMA",
  "PAMI",
  "Particular / sin obra social",
  "Otra",
];

export const MOCK_MEDICOS = [
  { id: "m1", nombre: "Laura Gómez", email: "medico@deca.com", dni: "30112445", matricula: "MP-10234" },
  { id: "m2", nombre: "Ricardo Paz", email: "ricardo.paz@deca.com", dni: "27884310", matricula: "MP-88210" },
];

export const MOCK_PACIENTES = [
  { id: "p1", nombre: "Marcos Ibáñez", dni: "34.221.098", medicoId: "m1" },
  { id: "p2", nombre: "Sofía Reinoso", dni: "40.556.712", medicoId: "m1" },
  { id: "p3", nombre: "Julián Ferreyra", dni: "29.887.410", medicoId: "m2" },
];

export const MOCK_ANALISIS = [
  {
    id: "a1",
    pacienteId: "p1",
    resumen: "Sin hallazgos compatibles con Chagas",
    fecha: "2026-07-28",
    hora: "10:15",
    estado: "negativo",
    resultado: 8,
  },
  {
    id: "a2",
    pacienteId: "p1",
    resumen: "Alteración leve del ritmo, se sugiere control",
    fecha: "2026-06-02",
    hora: "09:40",
    estado: "seguimiento",
    resultado: 46,
  },
  {
    id: "a3",
    pacienteId: "p2",
    resumen: "Patrón sugestivo, derivar a cardiología",
    fecha: "2026-07-30",
    hora: "16:05",
    estado: "positivo",
    resultado: 92,
  },
  {
    id: "a4",
    pacienteId: "p3",
    resumen: "Sin hallazgos compatibles con Chagas",
    fecha: "2026-07-15",
    hora: "12:20",
    estado: "negativo",
    resultado: 11,
  },
];

export const MOCK_CONTACTS = {
  administrador: [
    { id: "m1", nombre: "Dra. Laura Gómez", ultimo: "¿Podés habilitarme un paciente nuevo?", hora: "10:05" },
    { id: "m2", nombre: "Dr. Ricardo Paz", ultimo: "Ya cargué los ECG de la semana.", hora: "ayer" },
  ],
  medico: [
    { id: "p1", nombre: "Marcos Ibáñez", ultimo: "Gracias doctora, quedo atento.", hora: "09:41" },
    { id: "p2", nombre: "Sofía Reinoso", ultimo: "¿Puedo pedir el turno para el jueves?", hora: "ayer" },
  ],
  paciente: [
    { id: "m1", nombre: "Dra. Laura Gómez", ultimo: "Perfecto, nos vemos en el control.", hora: "09:42" },
    { id: "c1", nombre: "Centro DECA", ultimo: "Tu turno quedó confirmado para el 20/8.", hora: "ayer" },
  ],
};

export const MOCK_PROXIMO_ANALISIS = {
  fecha: "2026-08-20",
  hora: "09:00",
  lugar: "Centro DECA · Sede Centro",
};

export const MOCK_NOVEDADES = [
  {
    id: "n1",
    titulo: "Nueva versión del análisis de ECG",
    texto: "El modelo ahora detecta alteraciones del ritmo con mayor precisión.",
    fecha: "hace 2 días",
  },
  {
    id: "n2",
    titulo: "Recordatorios de turnos",
    texto: "Vas a recibir un aviso 24 hs antes de cada estudio programado.",
    fecha: "hace 1 semana",
  },
  {
    id: "n3",
    titulo: "Guía sobre Chagas",
    texto: "Sumamos material para entender qué significan tus resultados.",
    fecha: "hace 2 semanas",
  },
];

export const MOCK_NOVEDADES_ADMIN = [
  {
    id: "na1",
    titulo: "Nuevos pacientes designados",
    texto: "Se sumaron 3 pacientes a la plataforma en la última semana.",
    fecha: "hace 2 días",
  },
  {
    id: "na2",
    titulo: "Actividad de análisis",
    texto: "Los médicos cargaron 12 electrocardiogramas nuevos este mes.",
    fecha: "hace 5 días",
  },
  {
    id: "na3",
    titulo: "Validación de matrículas",
    texto: "Recordá revisar las solicitudes de registro antes de las 72 hs.",
    fecha: "hace 1 semana",
  },
];

export const MOCK_MESSAGES = [
  { id: 1, from: "them", text: "Hola, ¿cómo te sentiste después del último análisis?" },
  { id: 2, from: "me", text: "Bien, sin síntomas raros esta semana." },
  { id: 3, from: "them", text: "Perfecto, nos vemos en el control." },
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, tipo: "resultado", texto: "Tu análisis del 30/07 ya está disponible.", fecha: "hace 2 días" },
  { id: 2, tipo: "chat", texto: "Tenés un mensaje nuevo de Dra. Laura Gómez.", fecha: "hace 3 días" },
  { id: 3, tipo: "novedad", texto: "DECA sumó recordatorios de turnos.", fecha: "hace 1 semana" },
];
