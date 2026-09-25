import type { SignupErrors, SignupField, SignupForm, SignupValidation } from "../types";

export const BASE_FIELDS: SignupField[] = ["fechaNacimiento", "role"];

/** Lo que pide el registro manual además del perfil (con Google ya vienen nombre y mail). */
export const CREDENTIAL_FIELDS: SignupField[] = ["nombreCompleto", "mail", "contrasena"];

export const MIN_PASSWORD = 8;

export const FIELDS_BY_ROLE: Record<string, SignupField[]> = {
  paciente: ["dni", "obraSocial"],
  medico: ["dni", "matricula"],
};

export const SIN_OBRA_SOCIAL = "Particular / sin obra social";

export const OTRA_OBRA_SOCIAL = "Otra";

export const FIELD_LABEL: Record<SignupField, string> = {
  nombreCompleto: "Nombre y apellido",
  mail: "Mail",
  contrasena: "Contraseña",
  fechaNacimiento: "Fecha de nacimiento",
  role: "Médico o paciente",
  dni: "DNI",
  obraSocial: "Obra social",
  obraSocialOtra: "Nombre de la obra social",
  credencial: "Número de credencial",
  matricula: "Matrícula",
};

export function pideCredencial(form: SignupForm): boolean {
  return (
    form.role === "paciente" && !!form.obraSocial && form.obraSocial !== SIN_OBRA_SOCIAL
  );
}

export function requiredFields(form: SignupForm, extraFields: SignupField[] = []): SignupField[] {
  const extra = FIELDS_BY_ROLE[form.role] || [];
  const fields = [...extraFields, ...BASE_FIELDS, ...extra];
  if (form.obraSocial === OTRA_OBRA_SOCIAL) fields.push("obraSocialOtra");
  if (pideCredencial(form)) fields.push("credencial");
  return fields;
}

const trim = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const soloDigitos = (v: unknown): string => trim(v).replace(/\D/g, "");

export const MAX_LENGTH = {
  nombreCompleto: 80,
  mail: 120,
  dni: 8,
  credencial: 20,
  obraSocialOtra: 40,
  matricula: 12,
} satisfies Partial<Record<SignupField, number>>;

export const MIN_LENGTH = {
  dni: 7,
  credencial: 6,
  matricula: 4,
} satisfies Partial<Record<SignupField, number>>;

const PERMITIDO: Partial<Record<SignupField, RegExp>> = {
  dni: /\D/g,
  credencial: /[^0-9 -]/g,
  matricula: /[^A-Za-z0-9-]/g,
};

const MAX_POR_CAMPO: Partial<Record<SignupField, number>> = MAX_LENGTH;

export function sanitizeField(field: SignupField, value: unknown): string {
  let out = typeof value === "string" ? value : "";
  const invalido = PERMITIDO[field];
  if (invalido) out = out.replace(invalido, "");
  if (field === "matricula") out = out.toUpperCase();
  const max = MAX_POR_CAMPO[field];
  if (max) out = out.slice(0, max);
  return out;
}

/** Separa "Nombre y apellido": la primera palabra es el nombre y el resto el apellido. */
export function splitNombreCompleto(value: string): { nombre: string; apellido: string } {
  const [nombre = "", ...resto] = trim(value).split(/\s+/);
  return { nombre, apellido: resto.join(" ") };
}

const MAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * `extraFields` suma campos que no todas las pantallas piden: el registro manual
 * pasa CREDENTIAL_FIELDS y el perfil que viene de Google sólo la contraseña.
 */
export function validateSignup(
  form: SignupForm,
  extraFields: SignupField[] = []
): SignupValidation {
  const errors: SignupErrors = {};
  const missing: string[] = [];

  for (const field of requiredFields(form, extraFields)) {
    if (!trim(form[field])) {
      errors[field] = "Este dato es obligatorio.";
      missing.push(FIELD_LABEL[field]);
    }
  }

  if (extraFields.includes("nombreCompleto") && !errors.nombreCompleto) {
    if (!splitNombreCompleto(form.nombreCompleto).apellido) {
      errors.nombreCompleto = "Escribí tu nombre y tu apellido.";
    }
  }

  if (extraFields.includes("mail") && !errors.mail && !MAIL_VALIDO.test(trim(form.mail))) {
    errors.mail = "Revisá el mail, no parece válido.";
  }

  if (
    extraFields.includes("contrasena") &&
    !errors.contrasena &&
    form.contrasena.length < MIN_PASSWORD
  ) {
    errors.contrasena = `La contraseña tiene que tener al menos ${MIN_PASSWORD} caracteres.`;
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

export function summarizeErrors({ errors, missing }: Omit<SignupValidation, "ok">): string {
  if (missing.length) return `Faltan datos: ${missing.join(", ")}.`;
  const first = Object.keys(errors)[0] as SignupField | undefined;
  return first ? `${FIELD_LABEL[first]}: ${errors[first]}` : "";
}

export function normalizeSignup(form: SignupForm) {
  const base = {
    fechaNacimiento: form.fechaNacimiento,
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
