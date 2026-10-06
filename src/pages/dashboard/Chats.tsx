import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { useSesion } from "../../context/AuthContext";
import { api } from "../../services/api";
import { IconSearch, IconSend, IconTrash, IconUserCircle } from "../../components/icons/Icons";
import { mensajeDeError } from "../../utils/errors";
import type { EnviarMensajePayload } from "../../services/api";
import type { ConversacionAdmin, Medico, Mensaje, Paciente, TipoContraparte } from "../../types";

/** La contraparte del chat: mis pacientes o mi médico, y los admins que me escribieron. */
export interface Contacto {
  tipo: TipoContraparte;
  id: number | string;
  nombre: string;
}

/** Lo que mandan las listas del admin al tocar "Escribir". */
export interface NuevoChatState {
  nuevoChat?: Contacto;
}

const ETIQUETA_TIPO: Record<TipoContraparte, string> = {
  paciente: "Paciente",
  medico: "Médico",
  admin: "Administración",
};

/** Un médico y un admin pueden tener el mismo id: la clave necesita el tipo. */
function claveDe(c: Pick<Contacto, "tipo" | "id">) {
  return `${c.tipo}-${c.id}`;
}

function horaCorta(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function contactoDesdeConversacion(c: ConversacionAdmin): Contacto {
  const nombre = `${c.nombre} ${c.apellido}`;
  if (c.admin_id !== undefined) return { tipo: "admin", id: c.admin_id, nombre };
  return { tipo: c.usuario_tipo ?? "paciente", id: c.usuario_id ?? "", nombre };
}

async function cargarContactos(esAdmin: boolean, esMedico: boolean): Promise<Contacto[]> {
  const conversacionesAdmin = api.mensajesAdmin
    .conversaciones()
    .then((d) => d.conversaciones.map(contactoDesdeConversacion));

  if (esAdmin) return conversacionesAdmin;

  const pedido: Promise<{ pacientes?: Paciente[]; medicos?: Medico[] }> = esMedico
    ? api.usuarios.listar()
    : api.medicos.listar();
  const [data, admins] = await Promise.all([pedido, conversacionesAdmin.catch(() => [])]);
  const propios: Contacto[] = (data.pacientes || data.medicos || []).map((c) => ({
    tipo: esMedico ? "paciente" : "medico",
    id: c.id,
    nombre: `${c.nombre} ${c.apellido}`,
  }));
  return [...propios, ...admins];
}

function Chats() {
  const currentUser = useSesion();
  const esMedico = currentUser.role === "medico";
  const esAdmin = currentUser.role === "administrador";
  const miRolBackend = esAdmin ? "admin" : currentUser.role;
  const nuevoChat = (useLocation().state as NuevoChatState | null)?.nuevoChat;

  const [contacts, setContacts] = useState<Contacto[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(nuevoChat ? claveDe(nuevoChat) : null);
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    cargarContactos(esAdmin, esMedico)
      .then((lista) => {
        if (cancelado) return;
        setContacts(lista);
        setActiveKey((prev) => prev ?? (lista[0] ? claveDe(lista[0]) : null));
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err));
      })
      .finally(() => {
        if (!cancelado) setLoadingContacts(false);
      });
    return () => {
      cancelado = true;
    };
  }, [esMedico, esAdmin, currentUser.id]);

  const borrador =
    nuevoChat && !contacts.some((c) => claveDe(c) === claveDe(nuevoChat)) ? nuevoChat : null;
  const visibles = borrador ? [borrador, ...contacts] : contacts;
  const filtrados = visibles.filter((c) => c.nombre.toLowerCase().includes(query.trim().toLowerCase()));
  const active = visibles.find((c) => claveDe(c) === activeKey);
  const conAdmin = !!active && (esAdmin || active.tipo === "admin");
  const esBorrador = !!active && active === borrador;
  const activeTipo = active?.tipo;
  const activeId = active?.id;

  useEffect(() => {
    if (!activeTipo || activeId === undefined) return;
    if (esBorrador) {
      setMessages([]);
      return;
    }
    let cancelado = false;
    setLoadingMessages(true);
    const pedido = conAdmin
      ? api.mensajesAdmin.conversacion(activeTipo, activeId)
      : api.mensajes.conversacion(activeId);
    pedido
      .then((data) => {
        if (!cancelado) setMessages(data.mensajes);
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err));
      })
      .finally(() => {
        if (!cancelado) setLoadingMessages(false);
      });
    return () => {
      cancelado = true;
    };
  }, [activeTipo, activeId, esBorrador, conAdmin]);

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    const contenido = draft.trim();
    setDraft("");
    try {
      let mensaje: Mensaje;
      if (conAdmin) {
        ({ mensaje } = await api.mensajesAdmin.enviar({
          contraparteTipo: active.tipo,
          contraparteId: active.id,
          contenido,
        }));
      } else {
        const payload: EnviarMensajePayload = esMedico
          ? { pacienteId: active.id, contenido }
          : { medicoId: active.id, contenido };
        ({ mensaje } = await api.mensajes.enviar(payload));
      }
      setMessages((prev) => [...prev, mensaje]);

      if (esBorrador) setContacts(await cargarContactos(esAdmin, esMedico));
    } catch (err) {
      setError(mensajeDeError(err));
    }
  };

  const handleDelete = async (id: Mensaje["id"]) => {
    try {
      await (conAdmin ? api.mensajesAdmin.eliminar(id) : api.mensajes.eliminar(id));
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, eliminado: true, contenido: null } : m)));
    } catch (err) {
      setError(mensajeDeError(err));
    }
  };

  if (loadingContacts) {
    return (
      <div>
        <h1 className="page-title">Chats</h1>
        <p className="empty-state">Cargando…</p>
      </div>
    );
  }

  if (visibles.length === 0) {
    return (
      <div>
        <h1 className="page-title">Chats</h1>
        {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
        <p className="empty-state">
          {esAdmin
            ? "Todavía no le escribiste a nadie. Usá el botón «Escribir» en Pacientes o Médicos para empezar una conversación."
            : esMedico
              ? "Todavía no tenés pacientes asignados para conversar."
              : "Todavía no tenés un médico asignado para conversar."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Chats</h1>
      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
      <div className="chat-layout">
        <div className="chat-contacts">
          <label className="dash-search">
            <IconSearch size={16} />
            <input
              type="search"
              placeholder="Buscar chats"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {filtrados.length === 0 && <p className="empty-state">Sin chats que coincidan.</p>}
          {filtrados.map((c) => {
            const clave = claveDe(c);
            return (
              <button
                key={clave}
                className={`chat-contact ${clave === activeKey ? "is-active" : ""}`}
                onClick={() => setActiveKey(clave)}
              >
                <IconUserCircle size={30} />
                <div className="chat-contact__info">
                  <p className="chat-contact__name">{c.nombre}</p>
                  <p className="chat-contact__preview">
                    {c === borrador ? "Nueva conversación" : ETIQUETA_TIPO[c.tipo]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="chat-thread">
          {active && (
            <>
              <div className="chat-thread__header">
                <IconUserCircle size={26} />
                <p>{active.nombre}</p>
              </div>
              <div className="chat-thread__messages">
                {loadingMessages && <p className="empty-state">Cargando mensajes…</p>}
                {!loadingMessages && messages.length === 0 && (
                  <p className="empty-state">
                    {esBorrador
                      ? `Escribí el primer mensaje: ${active.nombre} va a ver la conversación cuando lo envíes.`
                      : "Todavía no hay mensajes en esta conversación."}
                  </p>
                )}
                {messages.map((m) => {
                  const esMio = m.emisor === miRolBackend;
                  return (
                    <div key={m.id} className={`chat-bubble chat-bubble--${esMio ? "me" : "them"}`}>
                      <p>{m.eliminado ? "Mensaje eliminado" : m.contenido}</p>
                      <span className="chat-contact__time">{horaCorta(m.fecha_hora_entrega)}</span>
                      {esMio && !m.eliminado && (
                        <button
                          className="chat-bubble__delete"
                          aria-label="Eliminar mensaje"
                          onClick={() => handleDelete(m.id)}
                        >
                          <IconTrash size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <form className="chat-thread__composer" onSubmit={handleSend}>
                <label htmlFor="chat-draft" className="visually-hidden">
                  Escribir mensaje
                </label>
                <input
                  id="chat-draft"
                  placeholder="Escribí un mensaje…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button type="submit" className="icon-btn icon-btn--primary" aria-label="Enviar">
                  <IconSend size={17} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chats;
