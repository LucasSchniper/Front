import ConfirmModal from "./ConfirmModal";
import { IconLogout } from "./icons/Icons";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

/** Pop-up que pide confirmar antes de cerrar la sesión. */
function ConfirmLogoutModal({ onConfirm, onCancel }: Props) {
  return (
    <ConfirmModal
      icon={<IconLogout size={30} />}
      titulo="¿Querés cerrar sesión?"
      texto="Vas a salir de tu cuenta. Para volver a entrar vas a tener que iniciar sesión de nuevo."
      confirmarLabel="Cerrar sesión"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export default ConfirmLogoutModal;
