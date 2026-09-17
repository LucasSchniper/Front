import type { ReactNode } from "react";

interface FormFieldProps {
  label: ReactNode;
  id: string;
  error?: string;
  children?: ReactNode;
}

function FormField({ label, id, error, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}

export default FormField;
