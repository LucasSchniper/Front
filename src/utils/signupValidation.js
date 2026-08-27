
export const BASE_FIELDS = ["nombre", "apellido", "fechaNacimiento", "email", "password", "role"];

export const FIELDS_BY_ROLE = {
  paciente: ["dni", "obraSocial"],
  medico: ["dni", "matricula"],
};

export const SIN_OBRA_SOCIAL = "Particular / sin obra social";

export const OTRA_OBRA_SOCIAL = "Otra";

export const FIELD_LABEL = {
  nombre: "Nombre",
  apellido: "Apellido",
  fechaNacimiento: "Fecha de nacimiento",
  email: "Mail",
  password: "Contraseña",
  role: "Médico o paciente",
  dni: "DNI",
  obraSocial: "Obra social",
  obraSocialOtra: "Nombre de la obra social",
  credencial: "Número de credencial",
  matricula: "Matrícula",
};

export function pideCredencial(form) {
  return (
    form.role === "paciente" && !!form.obraSocial && form.obraSocial !== SIN_OBRA_SOCIAL
  );
}

export function requiredFields(form) {
  const extra = FIELDS_BY_ROLE[form.role] || [];
  const fields = [...BASE_FIELDS, ...extra];
  if (form.obraSocial === OTRA_OBRA_SOCIAL) fields.push("obraSocialOtra");
  if (pideCredencial(form)) fields.push("credencial");
  return fields;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const trim = (v) => (typeof v === "string" ? v.trim() : "");
const soloDigitos = (v) => trim(v).replace(/\D/g, "");

export const MAX_LENGTH = {
  nombre: 40,
  apellido: 40,
  email: 80,
  password: 64,
  dni: 8,
  credencial: 20,
  obraSocialOtra: 40,
  matricula: 12,
};

export const MIN_LENGTH = {
  dni: 7,
  credencial: 6,
  matricula: 4,
  password: 6,
};

const PERMITIDO = {
  nombre: /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g,
  apellido: /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g,
  dni: /\D/g,
  credencial: /[^0-9 -]/g,
  matricula: /[^A-Za-z0-9-]/g,
  email: /\s/g,
};

export function sanitizeField(field, value) {
  let out = typeof value === "string" ? value : "";
  const invalido = PERMITIDO[field];
  if (invalido) out = out.replace(invalido, "");
  if (field === "matricula") out = out.toUpperCase();
  const max = MAX_LENGTH[field];
  if (max) out = out.slice(0, max);
  return out;
}

export function validateSignup(form) {
  const errors = {};
  const missing = [];

  for (const field of requiredFields(form)) {
    if (!trim(form[field])) {
      errors[field] = "Este dato es obligatorio.";
      missing.push(FIELD_LABEL[field]);
    }
  }

  if (!errors.email && !EMAIL_RE.test(trim(form.email))) {
    errors.email = "Ingresá un mail válido (ejemplo: nombre@mail.com).";
  }

  if (!errors.password && trim(form.password).length < MIN_LENGTH.password) {
    errors.password = `La contraseña necesita al menos ${MIN_LENGTH.password} caracteres.`;
  }

  if (!errors.fechaNacimiento) {
    const fecha = new Date(`${form.fechaNacimiento}T00:00:00`);
    if (Number.isNaN(fecha.getTime())) {
      errors.fechaNacimiento = "Fecha inválida.";
    } else if (fecha > new Date()) {
      errors.fechaNacimiento = "La fecha no puede ser futura.";
    } else if (fecha.getFullYear() < 1900) {
      errors.fechaNacimiento = "Revisá el año de nacimiento.";
    }
  }

  if (!errors.dni && (form.role === "paciente" || form.role === "medico")) {
    const dni = soloDigitos(form.dni);
    if (dni.length < MIN_LENGTH.dni || dni.length > MAX_LENGTH.dni) {
      errors.dni = `El DNI tiene que tener ${MIN_LENGTH.dni} u ${MAX_LENGTH.dni} dígitos.`;
    }
  }

  if (!errors.credencial && pideCredencial(form)) {
    const credencial = soloDigitos(form.credencial);
    if (credencial.length < MIN_LENGTH.credencial) {
      errors.credencial = `La credencial tiene al menos ${MIN_LENGTH.credencial} números.`;
    }
  }

  if (
    !errors.matricula &&
    form.role === "medico" &&
    trim(form.matricula).length < MIN_LENGTH.matricula
  ) {
    errors.matricula = "Ingresá tu matrícula completa (ej.: MP-10234).";
  }

  return { errors, missing, ok: Object.keys(errors).length === 0 };
}

export function summarizeErrors({ errors, missing }) {
  if (missing.length) return `Faltan datos: ${missing.join(", ")}.`;
  const first = Object.keys(errors)[0];
  return first ? `${FIELD_LABEL[first]}: ${errors[first]}` : "";
}

export function normalizeSignup(form) {
  const base = {
    nombre: trim(form.nombre),
    apellido: trim(form.apellido),
    fechaNacimiento: form.fechaNacimiento,
    email: trim(form.email).toLowerCase(),
    password: form.password,
    role: form.role,
  };

  if (form.role === "medico") {
    return { ...base, dni: soloDigitos(form.dni), matricula: trim(form.matricula) };
  }

  return {
    ...base,
    dni: soloDigitos(form.dni),
    obraSocial:
      form.obraSocial === OTRA_OBRA_SOCIAL ? trim(form.obraSocialOtra) : trim(form.obraSocial),
    credencial: pideCredencial(form) ? trim(form.credencial) : "",
  };
}
