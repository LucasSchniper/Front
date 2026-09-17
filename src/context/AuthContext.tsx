import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken } from "../services/api";

const SESSION_KEY = "deca_session";

function saveToken(token) {
  try {
    setToken(token || null);
  } catch {}
}

function sessionFromPaciente(paciente) {
  return {
    id: paciente.id,
    role: "paciente",
    email: paciente.mail,
    nombre: paciente.nombre,
    apellido: paciente.apellido,
  };
}

function sessionFromMedico(medico) {
  return {
    id: medico.id,
    role: "medico",
    email: medico.mail,
    nombre: medico.nombre,
    apellido: medico.apellido,
  };
}

function sessionFromAdmin(admin) {
  return {
    id: admin.id,
    role: "administrador",
    email: admin.mail,
    nombre: admin.nombre,
    apellido: admin.apellido,
  };
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

function mapSolicitud(medico) {
  return {
    id: medico.id,
    email: medico.mail,
    nombre: medico.nombre,
    apellido: medico.apellido,
    dni: medico.dni,
    matricula: medico.matricula,
    fecha: medico.created_at,
  };
}

const ROL_FRONTEND = {
  paciente: "paciente",
  medico: "medico",
  admin: "administrador",
};

const SESSION_BUILDER = {
  paciente: sessionFromPaciente,
  medico: sessionFromMedico,
  admin: sessionFromAdmin,
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSession);
  const [solicitudesMedicos, setSolicitudesMedicos] = useState([]);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
  }, [currentUser]);

  const cargarSolicitudesPendientes = async () => {
    try {
      const { medicos } = await api.medicos.pendientes();
      setSolicitudesMedicos(medicos.map(mapSolicitud));
    } catch {
    }
  };

  useEffect(() => {
    if (currentUser?.role === "administrador") cargarSolicitudesPendientes();
  }, [currentUser?.role]);

  const loginWithOAuth = async (provider, credential) => {
    try {
      const data = await api.auth.iniciar(provider, credential);

      if (data.isNew) {
        return { ok: true, isNew: true, regToken: data.regToken, perfil: data.perfil, provider };
      }

      const construirSesion = SESSION_BUILDER[data.rol];
      const entidad = data[data.rol === "admin" ? "admin" : data.rol];
      const session = construirSesion(entidad);

      saveToken(data.token);
      setCurrentUser(session);
      return { ok: true, role: session.role };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const completeOAuthSignup = async ({ regToken, role, ...extra }) => {
    try {
      const data = await api.auth.completarRegistro({ regToken, role, ...extra });

      if (data.pendingApproval) {
        return { ok: true, pendingApproval: true };
      }

      const rolFrontend = ROL_FRONTEND[role] || role;
      const construirSesion = SESSION_BUILDER[role];
      const entidad = data[role];
      const session = construirSesion ? construirSesion(entidad) : null;

      if (session) {
        saveToken(data.token);
        setCurrentUser(session);
      }

      return { ok: true, role: rolFrontend };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const logout = () => {
    saveToken(null);
    setCurrentUser(null);
  };

  const aprobarMedico = async (id) => {
    await api.medicos.aprobar(id);
    setSolicitudesMedicos((prev) => prev.filter((s) => s.id !== id));
  };

  const rechazarMedico = async (id) => {
    await api.medicos.eliminar(id);
    setSolicitudesMedicos((prev) => prev.filter((s) => s.id !== id));
  };

  const value = useMemo(
    () => ({
      currentUser,
      loginWithOAuth,
      completeOAuthSignup,
      logout,
      solicitudesPendientes: solicitudesMedicos,
      aprobarMedico,
      rechazarMedico,
    }),
    [currentUser, solicitudesMedicos]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
