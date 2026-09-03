import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MOCK_ANALISIS, MOCK_NOVEDADES_ADMIN } from "../../data/mockData";
import { leerAsignaciones, medicoDePaciente } from "../../services/asignaciones";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  IconBolt,
  IconChat,
  IconChevronRight,
  IconDoctor,
  IconNews,
  IconPatient,
  IconShield,
  IconTrendUp,
  IconUsers,
} from "../../components/icons/Icons";

function AdminHome() {
  const { currentUser, solicitudesPendientes } = useAuth();

  const nombre = currentUser.nombre
    ? `${currentUser.nombre} ${currentUser.apellido || ""}`.trim()
    : currentUser.email.split("@")[0];

  // Mismas fuentes que usa la pantalla de asignacion del admin.
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    let cancelado = false;
    Promise.all([api.medicos.listar(), api.usuarios.listar()])
      .then(([dataMedicos, dataPacientes]) => {
        if (cancelado) return;
        setMedicos(dataMedicos.medicos || []);
        setPacientes(dataPacientes.pacientes || []);
      })
      .catch(() => {
        // El resto del dashboard sigue siendo util aunque falle el conteo.
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Contamos solo asignaciones vigentes: pacientes que existen hoy y cuyo
  // medico sigue teniendo acceso.
  const asignaciones = (() => {
    const mapa = leerAsignaciones();
    const medicosVigentes = new Set(medicos.map((m) => String(m.id)));
    return pacientes.filter((p) => medicosVigentes.has(medicoDePaciente(mapa, p.id))).length;
  })();

  const stats = [
    { icon: IconDoctor, label: "Médicos registrados", value: medicos.length },
    { icon: IconPatient, label: "Pacientes registrados", value: pacientes.length },
    { icon: IconUsers, label: "Asignaciones activas", value: asignaciones },
    { icon: IconTrendUp, label: "Análisis realizados", value: MOCK_ANALISIS.length },
  ];

  const acciones = [
    {
      to: "/administrador/medicos",
      icon: IconDoctor,
      label: "Gestionar médicos",
      hint: "Designar, quitar acceso y validar matrículas",
      badge: solicitudesPendientes.length,
    },
    {
      to: "/administrador/pacientes",
      icon: IconPatient,
      label: "Gestionar pacientes",
      hint: "Asignar el médico a cargo de cada paciente",
    },
    {
      to: "/administrador/chats",
      icon: IconChat,
      label: "Abrir chats",
      hint: "Consultas de los médicos del equipo",
    },
  ];

  return (
    <div>
      <h1 className="page-title">¡Bienvenido/a, {nombre}!</h1>
      <p className="page-subtitle">Gestioná usuarios y asignaciones en la plataforma.</p>

      <div className="admin-stats">
        {stats.map(({ icon: Icon, label, value }) => (
          <article className="stat-orb" key={label}>
            <span className="stat-orb__ring">
              <Icon size={30} />
            </span>
            <p className="stat-orb__label">{label}</p>
            <p className="stat-orb__value">{value}</p>
          </article>
        ))}
      </div>

      {solicitudesPendientes.length > 0 && (
        <div className="notif-item notif-item--action admin-alert">
          <span className="notif-item__icon">
            <IconShield size={18} />
          </span>
          <div>
            <p className="notif-item__text">
              {solicitudesPendientes.length === 1
                ? "1 médico está esperando que apruebes su registro."
                : `${solicitudesPendientes.length} médicos están esperando que apruebes su registro.`}
            </p>
            <Link to="/administrador/medicos" className="notif-item__action">
              Revisar solicitudes →
            </Link>
          </div>
        </div>
      )}

      <div className="admin-home__bottom">
        <article className="dash-card">
          <div className="dash-card__header">
            <IconBolt size={20} />
            <h2>Acciones rápidas</h2>
          </div>

          <ul className="quick-action-list">
            {acciones.map(({ to, icon: Icon, label, hint, badge }) => (
              <li key={to}>
                <Link to={to} className="quick-action">
                  <span className="quick-action__icon">
                    <Icon size={18} />
                  </span>
                  <span className="quick-action__text">
                    <span className="quick-action__label">{label}</span>
                    <span className="quick-action__hint">{hint}</span>
                  </span>
                  {badge > 0 && <span className="quick-action__badge">{badge}</span>}
                  <IconChevronRight size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="dash-card">
          <div className="dash-card__header">
            <IconNews size={20} />
            <h2>Novedades</h2>
          </div>

          <ul className="news-list">
            {MOCK_NOVEDADES_ADMIN.map((n) => (
              <li className="news-item" key={n.id}>
                <p className="news-item__title">{n.titulo}</p>
                <p className="news-item__text">{n.texto}</p>
                <p className="news-item__date">{n.fecha}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}

export default AdminHome;
