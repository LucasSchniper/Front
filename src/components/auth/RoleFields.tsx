import FormField from "./FormField";
import type { UpdateSignupField } from "./useSignupForm";
import { OBRAS_SOCIALES } from "../../data/mockData";
import { IconShield } from "../icons/Icons";
import { MAX_LENGTH, OTRA_OBRA_SOCIAL, pideCredencial } from "../../utils/signupValidation";
import type { SignupErrors, SignupForm } from "../../types";

interface RoleFieldsProps {
  form: SignupForm;
  errors: SignupErrors;
  update: UpdateSignupField;
}

/** Selector Médico/Paciente y los datos que pide cada rol. */
function RoleFields({ form, errors, update }: RoleFieldsProps) {
  return (
    <>
      <FormField label="Médico o paciente" id="signup-role" error={errors.role} hideLabel>
        <select
          id="signup-role"
          required
          value={form.role}
          onChange={update("role")}
          className={form.role ? undefined : "is-placeholder"}
        >
          <option value="">Médico/Paciente</option>
          <option value="medico">Médico</option>
          <option value="paciente">Paciente</option>
        </select>
      </FormField>

      {form.role && (
        <FormField label="DNI" id="signup-dni" error={errors.dni} hideLabel>
          <input
            id="signup-dni"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            maxLength={MAX_LENGTH.dni}
            placeholder="DNI (sólo números)"
            value={form.dni}
            onChange={update("dni")}
          />
        </FormField>
      )}

      {form.role === "paciente" && (
        <>
          <FormField label="Obra social" id="signup-obra" error={errors.obraSocial} hideLabel>
            <select
              id="signup-obra"
              required
              value={form.obraSocial}
              onChange={update("obraSocial")}
              className={form.obraSocial ? undefined : "is-placeholder"}
            >
              <option value="">Obra social</option>
              {OBRAS_SOCIALES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </FormField>

          {form.obraSocial === OTRA_OBRA_SOCIAL && (
            <FormField
              label="Nombre de la obra social"
              id="signup-obra-otra"
              error={errors.obraSocialOtra}
              hideLabel
            >
              <input
                id="signup-obra-otra"
                required
                maxLength={MAX_LENGTH.obraSocialOtra}
                placeholder="¿Cuál? Obra social o prepaga"
                value={form.obraSocialOtra}
                onChange={update("obraSocialOtra")}
              />
            </FormField>
          )}

          {pideCredencial(form) && (
            <FormField
              label="Número de credencial"
              id="signup-credencial"
              error={errors.credencial}
              hideLabel
            >
              <input
                id="signup-credencial"
                inputMode="numeric"
                required
                maxLength={MAX_LENGTH.credencial}
                placeholder="Número de credencial"
                value={form.credencial}
                onChange={update("credencial")}
              />
            </FormField>
          )}
        </>
      )}

      {form.role === "medico" && (
        <>
          <FormField label="Matrícula" id="signup-matricula" error={errors.matricula} hideLabel>
            <input
              id="signup-matricula"
              required
              maxLength={MAX_LENGTH.matricula}
              placeholder="Matrícula (ej.: MP-10234)"
              value={form.matricula}
              onChange={update("matricula")}
            />
          </FormField>

          <p className="auth-card__notice">
            <IconShield size={18} />
            <span>
              Las cuentas de médico las valida el administrador de DECA. Vas a poder ingresar en
              cuanto apruebe tu matrícula.
            </span>
          </p>
        </>
      )}
    </>
  );
}

export default RoleFields;
