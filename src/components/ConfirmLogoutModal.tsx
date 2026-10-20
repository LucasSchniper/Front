import { useEffect, useRef } from "react";
import { IconLogout } from "./icons/Icons";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

/** Pop-up que pide confirmar antes de cerrar la sesión. */
function ConfirmLogoutModal({ onConfirm, onCancel }: Props) {
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
        aria-labelledby="confirm-logout-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="confirm-modal__icon">
          <IconLogout size={30} />
        </span>
        <h2 id="confirm-logout-title" className="confirm-modal__title">
          ¿Querés cerrar sesión?
        </h2>
        <p className="confirm-modal__text">
          Vas a salir de tu cuenta. Para volver a entrar vas a tener que iniciar sesión de nuevo.
        </p>
        <div className="confirm-modal__actions">
          <button ref={cancelarRef} className="btn btn--ghost btn--sm" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn--primary btn--sm" onClick={onConfirm}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmLogoutModal;
