import { useEffect, useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth, useSesion } from "../../context/AuthContext";
import { IconBell, IconChat, IconEcgUpload, IconShield } from "../../components/icons/Icons";
import { mensajeDeError } from "../../utils/errors";
import type { IconProps } from "../../components/icons/Icons";
import type { Notificacion } from "../../types";

type IconoNotif = (p: IconProps) => ReactElement;

/** Lo que pinta la lista: mezcla las del backend con las solicitudes del admin. */
interface NotificacionUI {
  id: number | string;
  texto: string;
  fecha?: string;
  tipo?: string;
  leida?: boolean;
  delServidor?: boolean;
  accion?: { to: string; label: string };
}

const ICON_BY_TYPE: Record<string, IconoNotif> = {
  resultado: IconEcgUpload,
  chat: IconChat,
  novedad: IconBell,
  solicitud: IconShield,
};

const ICON_BY_TEXTO: [RegExp, IconoNotif][] = [
  [/mensaje/i, IconChat],
  [/análisis/i, IconEcgUpload],
];

function iconoPara(n: NotificacionUI): IconoNotif {
  if (n.tipo && ICON_BY_TYPE[n.tipo]) return ICON_BY_TYPE[n.tipo];
  const match = ICON_BY_TEXTO.find(([regex]) => regex.test(n.texto || ""));
  return match ? match[1] : IconBell;
}

function fechaCorta(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Notificaciones() {
  const currentUser = useSesion();
  const { solicitudesPendientes } = useAuth();
  const [delServidor, setDelServidor] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const esAdmin = currentUser.role === "administrador";

  useEffect(() => {
    if (esAdmin) {
      setLoading(false);
      return;
    }
    let cancelado = false;
    api.notificaciones
      .listar()
      .then((data) => {
        if (!cancelado) setDelServidor(data.notificaciones);
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err));
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [esAdmin]);

  const marcarLeida = (id: Notificacion["id"]) => {
    setDelServidor((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    api.notificaciones.marcarLeida(id).catch((err: unknown) => setError(mensajeDeError(err)));
  };

  const solicitudNotifs: NotificacionUI[] = esAdmin
    ? solicitudesPendientes.map((s) => ({
        id: `sol-${s.id}`,
        tipo: "solicitud",
        texto: `${s.nombre} ${s.apellido} quiere registrarse como médico (matrícula ${
          s.matricula || "sin informar"
        }). Revisá la solicitud para aprobarla o rechazarla.`,
        fecha: s.fecha,
        accion: { to: "/administrador/medicos", label: "Revisar solicitud" },
      }))
    : [];

  const notificaciones: NotificacionUI[] = [
    ...solicitudNotifs,
    ...delServidor.map((n) => ({
      id: n.id,
      texto: n.contenido,
      fecha: fechaCorta(n.fecha_hora_entrega),
      leida: n.leida,
      delServidor: true,
    })),
  ];

  return (
    <div>
      <h1 className="page-title">Notificaciones</h1>
      <p className="page-subtitle">Resultados, chats y novedades de DECA.</p>

      {loading && <p className="empty-state">Cargando…</p>}
      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
      {!loading && notificaciones.length === 0 && (
        <p className="empty-state">No tenés notificaciones todavía.</p>
      )}

      <div className="notif-list">
        {notificaciones.map((n) => {
          const Icon = iconoPara(n);
          return (
            <div
              className={`notif-item ${n.accion ? "notif-item--action" : ""}`}
              key={n.id}
              style={n.delServidor && n.leida ? { opacity: 0.6 } : undefined}
              onClick={n.delServidor && !n.leida ? () => marcarLeida(n.id) : undefined}
            >
              <span className="notif-item__icon">
                <Icon size={18} />
              </span>
              <div>
                <p className="notif-item__text">{n.texto}</p>
                <p className="notif-item__date">{n.fecha}</p>
                {n.accion && (
                  <Link to={n.accion.to} className="notif-item__action">
                    {n.accion.label} →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Notificaciones;
