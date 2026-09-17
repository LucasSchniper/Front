import type { SignupErrors, SignupField, SignupForm, SignupValidation } from "../types";

export const BASE_FIELDS: SignupField[] = ["fechaNacimiento", "role"];

export const FIELDS_BY_ROLE: Record<string, SignupField[]> = {
  paciente: ["dni", "obraSocial"],
  medico: ["dni", "matricula"],
};

export const SIN_OBRA_SOCIAL = "Particular / sin obra social";

export const OTRA_OBRA_SOCIAL = "Otra";

export const FIELD_LABEL: Record<SignupField, string> = {
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

export function requiredFields(form: SignupForm): SignupField[] {
  const extra = FIELDS_BY_ROLE[form.role] || [];
  const fields = [...BASE_FIELDS, ...extra];
  if (form.obraSocial === OTRA_OBRA_SOCIAL) fields.push("obraSocialOtra");
  if (pideCredencial(form)) fields.push("credencial");
  return fields;
}

const trim = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
const soloDigitos = (v: unknown): string => trim(v).replace(/\D/g, "");

export const MAX_LENGTH = {
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

export function validateSignup(form: SignupForm): SignupValidation {
  const errors: SignupErrors = {};
  const missing: string[] = [];

  for (const field of requiredFields(form)) {
    if (!trim(form[field])) {
      errors[field] = "Este dato es obligatorio.";
      missing.push(FIELD_LABEL[field]);
    }
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
