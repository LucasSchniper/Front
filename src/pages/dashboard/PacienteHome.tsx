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
import type { ContactoMock } from "../../data/mockData";
import type { Analisis, Medico, Turno } from "../../types";
import { bandaDe } from "../../utils/banda";
import { mensajeDeError } from "../../utils/errors";
import ConfirmModal from "../../components/ConfirmModal";

const fechaCorta = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

const horaCorta = (iso: string) => iso.slice(11, 16);

function PacienteHome() {
  const currentUser = useSesion();
  const [misAnalisis, setMisAnalisis] = useState<Analisis[]>([]);
  const ultimo = misAnalisis[0];
  const percentilUltimo = ultimo ? Math.round(Number(ultimo.porcentaje)) : 0;
  const sinPrioridad = misAnalisis.filter((a) => a.banda === "no_alta").length;
  const altos = misAnalisis.filter((a) => a.banda === "alta").length;

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const proximo = turnos[0];
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [errorTurno, setErrorTurno] = useState("");
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
    api.turnos
      .listar({ estado: "pendiente" })
      .then((data) => {
        if (!cancelado)
          setTurnos(
            data.turnos
              .filter((t) => t.estado === "pendiente")
              .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))
          );
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  /** Cancela el turno (el médico recupera ese horario) y le avisa por chat. */
  const cancelarTurno = async () => {
    if (!proximo) return;
    setErrorTurno("");
    setCancelando(true);
    try {
      await api.turnos.cancelar(proximo.id);
      setTurnos((prev) => prev.filter((t) => t.id !== proximo.id));
      setConfirmandoCancelacion(false);
      api.mensajes
        .enviar({
          medicoId: proximo.medico_id,
          contenido: `Cancelé mi turno del ${fechaCorta(proximo.fecha_hora)} a las ${horaCorta(proximo.fecha_hora)}hs. Ese horario quedó libre.`,
        })
        .catch(() => {});
    } catch (err) {
      setErrorTurno(mensajeDeError(err));
      setConfirmandoCancelacion(false);
    } finally {
      setCancelando(false);
    }
  };

  const nombre = currentUser.nombre
    ? `${currentUser.nombre} ${currentUser.apellido || ""}`.trim()
    : currentUser.email.split("@")[0];

  return (
    <div className="paciente-home">
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
        <article className="dash-card ultimo-resultado">
          <div className="ultimo-resultado__header">
            <IconClipboard size={30} />
            <div>
              <h2 className="ultimo-resultado__title">Último resultado</h2>
              <p className="ultimo-resultado__subtitle">Percentil de riesgo de Chagas</p>
            </div>
          </div>

          {ultimo ? (
            <>
              <p className="ultimo-resultado__value" title={bandaDe(ultimo).etiqueta}>
                {percentilUltimo}%
              </p>
              <span className="ultimo-resultado__bar" aria-hidden="true">
                <span
                  className="ultimo-resultado__bar-fill"
                  style={{ width: `${Math.min(100, Math.max(0, percentilUltimo))}%` }}
                />
              </span>
              <Link to="/paciente/analisis" className="ultimo-resultado__cta">
                Ver análisis
              </Link>
            </>
          ) : (
            <p className="empty-state">Todavía no tenés resultados cargados.</p>
          )}
        </article>

        <article className="dash-card proximo-turno">
          <div className="ultimo-resultado__header">
            <IconCalendar size={30} />
            <div>
              <h2 className="ultimo-resultado__title">Próximo análisis</h2>
              <p className="ultimo-resultado__subtitle">Fecha programada</p>
            </div>
          </div>

          {proximo ? (
            <>
              <p className="proximo-turno__fecha">{fechaCorta(proximo.fecha_hora)}</p>
              <p className="proximo-turno__hora">
                <IconClock size={22} />
                {horaCorta(proximo.fecha_hora)}hs
              </p>
              {errorTurno && <p className="proximo-turno__error">{errorTurno}</p>}
              <button
                type="button"
                className="btn btn--danger proximo-turno__cancelar"
                onClick={() => setConfirmandoCancelacion(true)}
              >
                Cancelar turno
              </button>
            </>
          ) : (
            <p className="empty-state">No tenés turnos programados.</p>
          )}
        </article>

        <article className="dash-card">
          <div className="dash-card__header">
            <IconSummary size={30} />
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
            <IconChat size={30} />
            <h2>Chats</h2>
            <Link to="/paciente/chats" className="dash-card__open">
              Abrir
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
            <IconNews size={30} />
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

      {confirmandoCancelacion && proximo && (
        <ConfirmModal
          icon={<IconCalendar size={30} />}
          titulo="¿Querés cancelar el turno?"
          texto={`Tu turno del ${fechaCorta(proximo.fecha_hora)} a las ${horaCorta(proximo.fecha_hora)}hs se va a cancelar y le vamos a avisar a tu médico.`}
          confirmarLabel={cancelando ? "Cancelando…" : "Cancelar turno"}
          cancelarLabel="Volver"
          cargando={cancelando}
          onConfirm={cancelarTurno}
          onCancel={() => !cancelando && setConfirmandoCancelacion(false)}
        />
      )}
    </div>
  );
}

export default PacienteHome;
