import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken } from "../services/api";
import {
  normalizeSignup,
  summarizeErrors,
  validateSignup,
} from "../utils/signupValidation";

const SESSION_KEY = "deca_session";
const USERS_KEY = "deca_users_v2";

// Respaldo para entornos sin un admin sembrado en la base (ver seedAdmin.js).
// Con un admin real, poner VITE_ALLOW_DEMO_LOGIN=false.
const DEMO_LOGIN = import.meta.env.VITE_ALLOW_DEMO_LOGIN !== "false";

const SEED_USERS = [
  {
    email: "admin@deca.com",
    password: "deca123",
    role: "administrador",
    nombre: "Admin",
    apellido: "DECA",
    estado: "aprobado",
  },
];

function loadStored(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(seed));
  } catch {}
  return seed;
}

const loadUsers = () =>
  loadStored(USERS_KEY, SEED_USERS).map((u) => ({ ...u, estado: u.estado || "aprobado" }));

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

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

function sessionFromLocal(user) {
  return {
    role: user.role,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
  };
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

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [currentUser, setCurrentUser] = useState(loadSession);
  const [solicitudesMedicos, setSolicitudesMedicos] = useState([]);
  const [pendingAuth, setPendingAuth] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {}
  }, [users]);

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
      // El admin todavia va a ver el resto del dashboard aunque esto falle.
    }
  };

  useEffect(() => {
    if (currentUser?.role === "administrador") cargarSolicitudesPendientes();
  }, [currentUser?.role]);

  const loginLocal = ({ email, password }) => {
    const mail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === mail && u.password === password);
    if (!user) return null;

    if (user.estado === "pendiente") {
      return {
        ok: false,
        error:
          "Tu registro como médico está esperando la aprobación del administrador. Te avisamos por mail cuando esté listo.",
      };
    }
    if (user.estado === "rechazado") {
      return {
        ok: false,
        error:
          "El administrador no validó tu registro como médico. Escribinos a deca@gmail.com si creés que es un error.",
      };
    }

    setPendingAuth({ token: null, session: sessionFromLocal(user), email: user.email });
    return { ok: true };
  };

  const login = async ({ email, password }) => {
    const credenciales = { mail: email.trim(), contrasena: password };

    // Probamos paciente y despues medico. Solo un rechazo de credenciales
    // (kind "auth") justifica seguir probando: si no llegamos al server o el
    // server fallo, cortamos y lo decimos, en vez de caer al login local y
    // simular una sesion que no tiene token.
    try {
      const { token, paciente } = await api.usuarios.login(credenciales);
      setPendingAuth({ token, session: sessionFromPaciente(paciente), email });
      return { ok: true };
    } catch (err) {
      if (err.kind !== "auth") return { ok: false, error: err.message };
    }

    try {
      const { token, medico } = await api.medicos.login(credenciales);
      setPendingAuth({ token, session: sessionFromMedico(medico), email });
      return { ok: true };
    } catch (err) {
      if (err.kind !== "auth") return { ok: false, error: err.message };
    }

    try {
      const { token, admin } = await api.admins.login(credenciales);
      setPendingAuth({ token, session: sessionFromAdmin(admin), email });
      return { ok: true };
    } catch (err) {
      if (err.kind !== "auth") return { ok: false, error: err.message };
    }

    // Llegamos aca solo si el back respondio y dijo que no son credenciales
    // suyas de ningun rol. Sirve como respaldo si todavia no se corrio
    // npm run seed:admin en el back (sin admin real en la base).
    if (DEMO_LOGIN) {
      const local = loginLocal({ email, password });
      if (local) return local;
    }

    return { ok: false, error: "Mail o contraseña incorrectos." };
  };

  const signUp = async (form) => {
    const validation = validateSignup(form);
    if (!validation.ok) {
      return { ok: false, error: summarizeErrors(validation), errors: validation.errors };
    }

    const nuevo = normalizeSignup(form);
    const yaExiste = users.some((u) => u.email.toLowerCase() === nuevo.email);
    if (yaExiste) {
      return {
        ok: false,
        error: "Ya existe una cuenta con ese mail.",
        errors: { email: "Ya existe una cuenta con ese mail." },
      };
    }

    if (nuevo.role === "medico") {
      try {
        await api.medicos.registro({
          nombre: nuevo.nombre,
          apellido: nuevo.apellido,
          mail: nuevo.email,
          contrasena: nuevo.password,
          dni: nuevo.dni,
          matricula: nuevo.matricula,
        });
      } catch (err) {
        return { ok: false, error: err.message, errors: {} };
      }
      return { ok: true, pendingApproval: true };
    }

    try {
      await api.usuarios.registro({
        nombre: nuevo.nombre,
        apellido: nuevo.apellido,
        mail: nuevo.email,
        contrasena: nuevo.password,
        fechaNacimiento: nuevo.fechaNacimiento,
        dni: nuevo.dni,
        obraSocial: nuevo.obraSocial || undefined,
      });
    } catch (err) {
      return { ok: false, error: err.message, errors: {} };
    }

    setUsers((prev) => [...prev, { ...nuevo, estado: "aprobado" }]);
    return login({ email: nuevo.email, password: nuevo.password });
  };

  const confirmCode = (code) => {
    if (!pendingAuth) return { ok: false, error: "No hay una verificación en curso." };
    if (!code || code.trim().length < 4) {
      return { ok: false, error: "Ingresá el código de 4 a 6 dígitos que te enviamos." };
    }
    const { token, session } = pendingAuth;
    saveToken(token);
    setCurrentUser(session);
    setPendingAuth(null);
    return { ok: true, role: session.role };
  };

  const logout = () => {
    saveToken(null);
    setCurrentUser(null);
    setPendingAuth(null);
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
      pendingAuth,
      signUp,
      login,
      confirmCode,
      logout,
      users,
      solicitudesPendientes: solicitudesMedicos,
      aprobarMedico,
      rechazarMedico,
    }),
    [currentUser, pendingAuth, users, solicitudesMedicos]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
