import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo";
import { IconMenu, IconClose, IconBell } from "../../components/icons/Icons";

function DashboardLayout() {
  const { currentUser, logout, solicitudesPendientes } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const contentRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const pendientes =
    currentUser.role === "administrador" ? solicitudesPendientes.length : 0;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <button
          className="dashboard__burger"
          aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? <IconClose /> : <IconMenu />}
        </button>

        <Link to={`/${currentUser.role}`} className="dashboard__brand">
          <Logo />
        </Link>

        <Link
          to={`/${currentUser.role}/notificaciones`}
          className="dashboard__notif-btn"
          aria-label={
            pendientes > 0 ? `Notificaciones (${pendientes} sin leer)` : "Notificaciones"
          }
        >
          <IconBell size={20} />
          {pendientes > 0 && <span className="dashboard__notif-dot">{pendientes}</span>}
        </Link>
      </header>

      <div className="dashboard__body">
        <Sidebar
          role={currentUser.role}
          onLogout={handleLogout}
          open={sidebarOpen}
          onNavigate={() => setSidebarOpen(false)}
        />

        {sidebarOpen && <div className="dashboard__scrim" onClick={() => setSidebarOpen(false)} />}

        <main className="dashboard__main">
          <div className="dashboard__content" ref={contentRef}>
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="dashboard__footer">
        <span>Contáctanos: deca@gmail.com</span>
      </footer>
    </div>
  );
}

export default DashboardLayout;
