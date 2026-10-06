import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSesion } from "../../context/AuthContext";
import { api } from "../../services/api";
import { MOCK_NOVEDADES } from "../../data/mockData";
import {
  IconAlert,
  IconCalendar,
  IconChat,
  IconClipboard,
  IconClock,
  IconDoctor,
  IconHeartCheck,
  IconNews,
  IconPulse,
  IconSummary,
  IconUserCircle,
} from "../../components/icons/Icons";
import type { ContactoMock, ProximoAnalisisMock } from "../../data/mockData";
import type { Analisis, Medico } from "../../types";
import { ADVERTENCIA_TAMIZAJE, bandaDe, percentilDe } from "../../utils/banda";

const fechaCorta = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)}/${Number(m)}/${y}`;
};

function PacienteHome() {
  const currentUser = useSesion();
  const [misAnalisis, setMisAnalisis] = useState<Analisis[]>([]);
  const ultimo = misAnalisis[0];
  const sinPrioridad = misAnalisis.filter((a) => a.banda === "no_alta").length;
  const altos = misAnalisis.filter((a) => a.banda === "alta").length;

  const proximo = null as ProximoAnalisisMock | null;
  const chats: ContactoMock[] = [];

  const [miMedico, setMiMedico] = useState<Medico | null>(null);

  useEffect(() => {
    let cancelado = false;
    api.medicos
      .listar()
      .then((data) => {
        if (!cancelado) setMiMedico((data.medicos || [])[0] || null);
      })
      .catch(() => {
      });
    api.analisis
      .listarPropios()
      .then((data) => {
        if (!cancelado) setMisAnalisis(data.analisis);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  const nombre = currentUser.nombre
    ? `${currentUser.nombre} ${currentUser.apellido || ""}`.trim()
    : currentUser.email.split("@")[0];

  return (
    <div>
      <h1 className="page-title">¡Bienvenido/a, {nombre}!</h1>
      <p className="page-subtitle">Este es un resumen de tu salud y tu actividad.</p>

      <article className="dash-card mi-medico">
        <span className="mi-medico__icon">
          <IconDoctor size={22} />
        </span>
        <div className="mi-medico__info">
          <p className="mi-medico__label">Tu médico a cargo</p>
          {miMedico ? (
            <p className="mi-medico__name">
              Dr./Dra. {miMedico.nombre} {miMedico.apellido}
              {miMedico.matricula ? ` · Matrícula ${miMedico.matricula}` : ""}
            </p>
          ) : (
            <p className="mi-medico__name mi-medico__name--empty">
              Todavía no tenés un médico asignado.
            </p>
          )}
        </div>
        {miMedico && (
          <Link to="/paciente/chats" className="btn btn--primary btn--sm">
            Enviar mensaje
          </Link>
        )}
      </article>

      <div className="paciente-home__top">
        <article className="dash-card dash-card--highlight">
          <div className="dash-card__header">
            <IconClipboard size={20} />
            <h2>Último resultado</h2>
          </div>

          {ultimo ? (
            <>
              <div className="metric">
                <p className="metric__label">Resultado del tamizaje</p>
                <p className="metric__value">
                  <span className={`badge badge--${bandaDe(ultimo).clase}`}>{bandaDe(ultimo).etiqueta}</span>
                </p>
                {ultimo.texto_banda && <p className="analisis-banda__texto">{ultimo.texto_banda}</p>}
                <p className="metric__meta">
                  {percentilDe(ultimo)} · {fechaCorta(ultimo.fecha_hora_entrega)} ·{" "}
                  {ultimo.fecha_hora_entrega.slice(11, 16)}hs
                </p>
                <p className="analisis-banda__texto">{ADVERTENCIA_TAMIZAJE}</p>
              </div>
              <Link to="/paciente/analisis" className="btn btn--primary btn--sm dash-card__cta">
                Ver resultado completo
              </Link>
            </>
          ) : (
            <p className="empty-state">Todavía no tenés resultados cargados.</p>
          )}
        </article>

        <article className="dash-card">
          <div className="dash-card__header">
            <IconCalendar size={20} />
            <h2>Próximo análisis</h2>
          </div>

          {proximo ? (
            <>
              <div className="metric">
                <p className="metric__label">Fecha programada</p>
                <p className="metric__value metric__value--date">{fechaCorta(proximo.fecha)}</p>
                <p className="metric__time">
                  <IconClock size={16} />
                  {proximo.hora}hs
                </p>
                <p className="metric__meta">{proximo.lugar}</p>
              </div>
              <Link to="/paciente/analisis" className="btn btn--primary btn--sm dash-card__cta">
                Ver detalles
              </Link>
            </>
          ) : (
            <p className="empty-state">No tenés estudios programados.</p>
          )}
        </article>

        <article className="dash-card">
          <div className="dash-card__header">
            <IconSummary size={20} />
            <h2>Resumen</h2>
          </div>

          <ul className="summary-list">
            <li className="summary-row">
              <span className="summary-row__icon">
                <IconPulse size={17} />
              </span>
              <span className="summary-row__label">Análisis realizados</span>
              <span className="summary-row__value">{misAnalisis.length}</span>
            </li>
            <li className="summary-row">
              <span className="summary-row__icon summary-row__icon--ok">
                <IconHeartCheck size={17} />
              </span>
              <span className="summary-row__label">Sin prioridad por ECG</span>
              <span className="summary-row__value">{sinPrioridad}</span>
            </li>
            <li className="summary-row">
              <span className="summary-row__icon summary-row__icon--alert">
                <IconAlert size={17} />
              </span>
              <span className="summary-row__label">Prioridad alta</span>
              <span className="summary-row__value">{altos}</span>
            </li>
          </ul>
        </article>
      </div>

      <div className="paciente-home__bottom">
        <article className="dash-card">
          <div className="dash-card__header">
            <IconChat size={20} />
            <h2>Chats recientes</h2>
            <Link to="/paciente/chats" className="dash-card__link">
              Ver todos
            </Link>
          </div>

          {chats.length === 0 ? (
            <p className="empty-state">Todavía no tenés conversaciones.</p>
          ) : (
            <ul className="chat-preview-list">
              {chats.map((c) => (
                <li key={c.id}>
                  <Link to="/paciente/chats" className="chat-preview">
                    <IconUserCircle size={30} />
                    <span className="chat-preview__info">
                      <span className="chat-preview__name">{c.nombre}</span>
                      <span className="chat-preview__text">{c.ultimo}</span>
                    </span>
                    <span className="chat-preview__time">{c.hora}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="dash-card">
          <div className="dash-card__header">
            <IconNews size={20} />
            <h2>Novedades</h2>
          </div>

          <ul className="news-list">
            {MOCK_NOVEDADES.map((n) => (
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

export default PacienteHome;
