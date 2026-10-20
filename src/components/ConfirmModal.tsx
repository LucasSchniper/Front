import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  icon: ReactNode;
  titulo: string;
  texto: ReactNode;
  confirmarLabel: string;
  cancelarLabel?: string;
  cargando?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Pop-up genérico que pide confirmar una acción antes de hacerla. */
function ConfirmModal({
  icon,
  titulo,
  texto,
  confirmarLabel,
  cancelarLabel = "Cancelar",
  cargando = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelarRef.current?.focus();
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [onCancel]);

  return (
    <div className="confirm-modal__backdrop" onClick={onCancel}>
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="confirm-modal__icon">{icon}</span>
        <h2 id="confirm-modal-title" className="confirm-modal__title">
          {titulo}
        </h2>
        <p className="confirm-modal__text">{texto}</p>
        <div className="confirm-modal__actions">
          <button ref={cancelarRef} className="btn btn--ghost btn--sm" onClick={onCancel} disabled={cargando}>
            {cancelarLabel}
          </button>
          <button className="btn btn--primary btn--sm" onClick={onConfirm} disabled={cargando}>
            {confirmarLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
