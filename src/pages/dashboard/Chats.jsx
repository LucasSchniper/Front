import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import {
  leerAsignaciones,
  medicoDePaciente,
  pacientesDeMedico,
} from "../../services/asignaciones";
import { IconSend, IconTrash, IconUserCircle } from "../../components/icons/Icons";

function horaCorta(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function Chats() {
  const { currentUser } = useAuth();
  const esMedico = currentUser.role === "medico";

  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const esAdmin = currentUser.role === "administrador";

  useEffect(() => {
    if (esAdmin) {
      setLoadingContacts(false);
      return;
    }
    let cancelado = false;
    const pedido = esMedico ? api.usuarios.listar() : api.medicos.listar();
    pedido
      .then((data) => {
        if (cancelado) return;
        // Solo se hablan los que estan asignados entre si.
        const asignaciones = leerAsignaciones();
        const crudos = data.pacientes || data.medicos || [];
        const propios = esMedico
          ? pacientesDeMedico(asignaciones, crudos, currentUser.id)
          : crudos.filter(
              (m) => String(m.id) === String(medicoDePaciente(asignaciones, currentUser.id))
            );
        const lista = propios.map((c) => ({
          id: c.id,
          nombre: `${c.nombre} ${c.apellido}`,
        }));
        setContacts(lista);
        setActiveId(lista[0]?.id ?? null);
      })
      .catch((err) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setLoadingContacts(false);
      });
    return () => {
      cancelado = true;
    };
  }, [esMedico, esAdmin, currentUser.id]);

  useEffect(() => {
    if (!activeId) return;
    let cancelado = false;
    setLoadingMessages(true);
    api.mensajes
      .conversacion(activeId)
      .then((data) => {
        if (!cancelado) setMessages(data.mensajes);
      })
      .catch((err) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setLoadingMessages(false);
      });
    return () => {
      cancelado = true;
    };
  }, [activeId]);

  const active = contacts.find((c) => c.id === activeId);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    const contenido = draft.trim();
    setDraft("");
    try {
      const payload = esMedico ? { pacienteId: activeId, contenido } : { medicoId: activeId, contenido };
      const { mensaje } = await api.mensajes.enviar(payload);
      setMessages((prev) => [...prev, mensaje]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.mensajes.eliminar(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, eliminado: true, contenido: null } : m)));
    } catch (err) {
      setError(err.message);
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

  if (contacts.length === 0) {
    return (
      <div>
        <h1 className="page-title">Chats</h1>
        <p className="empty-state">
          {esMedico
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
          {contacts.map((c) => (
            <button
              key={c.id}
              className={`chat-contact ${c.id === activeId ? "is-active" : ""}`}
              onClick={() => setActiveId(c.id)}
            >
              <IconUserCircle size={30} />
              <div className="chat-contact__info">
                <p className="chat-contact__name">{c.nombre}</p>
              </div>
            </button>
          ))}
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
                  <p className="empty-state">Todavía no hay mensajes en esta conversación.</p>
                )}
                {messages.map((m) => {
                  const esMio = m.emisor === currentUser.role;
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
