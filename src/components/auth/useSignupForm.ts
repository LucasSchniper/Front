import { useState, type ChangeEvent } from "react";
import {
  SIN_OBRA_SOCIAL,
  sanitizeField,
  summarizeErrors,
  validateSignup,
} from "../../utils/signupValidation";
import type { SignupErrors, SignupField, SignupForm } from "../../types";

const EMPTY: SignupForm = {
  nombreCompleto: "",
  mail: "",
  contrasena: "",
  fechaNacimiento: "",
  role: "",
  dni: "",
  obraSocial: "",
  obraSocialOtra: "",
  credencial: "",
  matricula: "",
};

const ROLE_DEPENDENT_ERRORS: SignupField[] = [
  "role",
  "dni",
  "obraSocial",
  "obraSocialOtra",
  "credencial",
  "matricula",
];

const OBRA_SOCIAL_DEPENDENT_ERRORS: SignupField[] = ["obraSocial", "obraSocialOtra", "credencial"];

const sinErroresDe = (errores: SignupErrors, campos: SignupField[]): SignupErrors =>
  Object.fromEntries(
    Object.entries(errores).filter(([campo]) => !campos.includes(campo as SignupField))
  );

export type UpdateSignupField = (
  field: SignupField
) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;

/**
 * Estado del formulario de registro, compartido entre el sign up manual y el
 * "completá tu perfil" que sigue al acceso con Google.
 */
export function useSignupForm(initial: Partial<SignupForm> = {}) {
  const [form, setForm] = useState<SignupForm>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<SignupErrors>({});

  const update: UpdateSignupField = (field) => (e) => {
    const value = sanitizeField(field, e.target.value);
    setForm((f) => ({ ...f, [field]: value }));

    if (field === "role") {
      setErrors((prev) => sinErroresDe(prev, ROLE_DEPENDENT_ERRORS));
      return;
    }

    if (field === "obraSocial") {
      if (value === SIN_OBRA_SOCIAL) setForm((f) => ({ ...f, credencial: "" }));
      setErrors((prev) => sinErroresDe(prev, OBRA_SOCIAL_DEPENDENT_ERRORS));
      return;
    }

    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _omit, ...rest } = prev;
      return rest;
    });
  };

  /** Valida y marca los campos con error. Devuelve el resumen, o "" si está todo bien. */
  const validate = (extraFields: SignupField[] = []): string => {
    const validation = validateSignup(form, extraFields);
    setErrors(validation.errors);
    return validation.ok ? "" : summarizeErrors(validation);
  };

  return { form, errors, update, validate };
}
