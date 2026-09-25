import type { ReactNode } from "react";

interface FormFieldProps {
  label: ReactNode;
  id: string;
  error?: string;
  /** El diseño de login/sign up muestra el texto como placeholder; el label queda para lectores de pantalla. */
  hideLabel?: boolean;
  children?: ReactNode;
}

function FormField({ label, id, error, hideLabel = false, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id} className={hideLabel ? "visually-hidden" : undefined}>
        {label}
      </label>
      {children}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}

export default FormField;
