import { NavLink } from "react-router-dom";
import heartEcgMark from "../../assets/brand/heart-ecg-mark.png";
import {
  IconHome,
  IconUsers,
  IconPatient,
  IconEcgUpload,
  IconChat,
  IconSettings,
  IconLogout,
} from "../../components/icons/Icons";

const NAV_BY_ROLE = {
  administrador: [
    { to: "/administrador", label: "Inicio", icon: IconHome, end: true },
    { to: "/administrador/medicos", label: "Médicos", icon: IconUsers },
    { to: "/administrador/pacientes", label: "Pacientes", icon: IconPatient },
    { to: "/administrador/chats", label: "Chats", icon: IconChat },
    { to: "/administrador/perfil", label: "Mi perfil", icon: IconSettings },
  ],
  medico: [
    { to: "/medico", label: "Inicio", icon: IconHome, end: true },
    { to: "/medico/pacientes", label: "Pacientes", icon: IconPatient },
    { to: "/medico/chats", label: "Chats", icon: IconChat },
    { to: "/medico/perfil", label: "Mi perfil", icon: IconSettings },
  ],
  paciente: [
    { to: "/paciente", label: "Inicio", icon: IconHome, end: true },
    { to: "/paciente/analisis", label: "Mis análisis", icon: IconEcgUpload },
    { to: "/paciente/chats", label: "Chats", icon: IconChat },
    { to: "/paciente/perfil", label: "Mi perfil", icon: IconSettings },
  ],
};

function Sidebar({ role, onLogout, open, onNavigate }) {
  const items = NAV_BY_ROLE[role] || [];

  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
      <nav className="sidebar__nav">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}
            onClick={onNavigate}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}

        <button className="sidebar__link sidebar__link--logout" onClick={onLogout}>
          <IconLogout size={19} />
          <span>Cerrar sesión</span>
        </button>
      </nav>

      <img src={heartEcgMark} alt="" aria-hidden="true" className="sidebar__decor" />
    </aside>
  );
}

export default Sidebar;
