import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  MOCK_ANALISIS,
  MOCK_CONTACTS,
  MOCK_NOVEDADES,
  MOCK_PROXIMO_ANALISIS,
} from "../../data/mockData";
import {
  IconAlert,
  IconCalendar,
  IconChat,
  IconClipboard,
  IconClock,
  IconHeartCheck,
  IconNews,
  IconPulse,
  IconSummary,
  IconUserCircle,
} from "../../components/icons/Icons";

const DEMO_PATIENT_EMAIL = "paciente@deca.com";

const fechaCorta = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${Number(d)}/${Number(m)}/${y}`;
};

function PacienteHome() {
  const { currentUser } = useAuth();
  const isDemoPatient = currentUser.email === DEMO_PATIENT_EMAIL;

  const misAnalisis = isDemoPatient ? MOCK_ANALISIS.filter((a) => a.pacienteId === "p1") : [];
  const ultimo = misAnalisis[0];
  const normales = misAnalisis.filter((a) => a.estado === "negativo").length;
  const altos = misAnalisis.length - normales;

  const proximo = isDemoPatient ? MOCK_PROXIMO_ANALISIS : null;
  const chats = isDemoPatient ? MOCK_CONTACTS.paciente : [];

  const nombre = currentUser.nombre
    ? `${currentUser.nombre} ${currentUser.apellido || ""}`.trim()
    : currentUser.email.split("@")[0];

  return (
    <div>
      <h1 className="page-title">¡Bienvenido/a, {nombre}!</h1>
      <p className="page-subtitle">Este es un resumen de tu salud y tu actividad.</p>

      <div className="paciente-home__top">
        <article className="dash-card dash-card--highlight">
          <div className="dash-card__header">
            <IconClipboard size={20} />
            <h2>Último resultado</h2>
          </div>

          {ultimo ? (
            <>
              <div className="metric">
                <p className="metric__label">Posibilidad de Chagas</p>
                <p className="metric__value">{ultimo.resultado}%</p>
                <div className="meter">
                  <span
                    className={`meter__fill meter__fill--${ultimo.estado}`}
                    style={{ width: `${ultimo.resultado}%` }}
                  />
                </div>
                <p className="metric__meta">
                  {fechaCorta(ultimo.fecha)} · {ultimo.hora}hs
                </p>
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
              <span className="summary-row__label">Resultados normales</span>
              <span className="summary-row__value">{normales}</span>
            </li>
            <li className="summary-row">
              <span className="summary-row__icon summary-row__icon--alert">
                <IconAlert size={17} />
              </span>
              <span className="summary-row__label">Resultados altos</span>
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
