import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken } from "../services/api";
import {
  normalizeSignup,
  summarizeErrors,
  validateSignup,
} from "../utils/signupValidation";

const SESSION_KEY = "deca_session";
const USERS_KEY = "deca_users_v2";
const REQUESTS_KEY = "deca_solicitudes_medico_v2";

// Cuando el back tenga rol admin, poner VITE_ALLOW_DEMO_LOGIN=false.
const DEMO_LOGIN = import.meta.env.VITE_ALLOW_DEMO_LOGIN !== "false";

// El administrador todavia no existe en el backend, asi que su cuenta se
// resuelve localmente. Pacientes y medicos se autentican siempre contra la API.
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

const SEED_REQUESTS = [];

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

const loadRequests = () => loadStored(REQUESTS_KEY, SEED_REQUESTS);

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

function sessionFromLocal(user) {
  return {
    role: user.role,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
  };
}

const hoy = () => new Date().toISOString().slice(0, 10);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [currentUser, setCurrentUser] = useState(loadSession);
  const [solicitudesMedicos, setSolicitudesMedicos] = useState(loadRequests);
  const [pendingAuth, setPendingAuth] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(solicitudesMedicos));
    } catch {}
  }, [solicitudesMedicos]);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
  }, [currentUser]);

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

    // Llegamos aca solo si el back respondio y dijo que no son credenciales
    // suyas. El admin todavia vive local, asi que este fallback sigue siendo
    // legitimo.
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
      setUsers((prev) => [...prev, { ...nuevo, estado: "pendiente" }]);
      setSolicitudesMedicos((prev) => [
        {
          id: `sol-${Date.now()}`,
          email: nuevo.email,
          nombre: nuevo.nombre,
          apellido: nuevo.apellido,
          dni: nuevo.dni,
          matricula: nuevo.matricula,
          estado: "pendiente",
          fecha: hoy(),
        },
        ...prev,
      ]);
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

  const resolverSolicitud = (id, estado) => {
    const solicitud = solicitudesMedicos.find((s) => s.id === id);
    if (!solicitud) return;
    setSolicitudesMedicos((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado, resueltaEl: hoy() } : s))
    );
    setUsers((prev) => prev.map((u) => (u.email === solicitud.email ? { ...u, estado } : u)));
  };

  const aprobarMedico = (id) => resolverSolicitud(id, "aprobado");
  const rechazarMedico = (id) => resolverSolicitud(id, "rechazado");

  const solicitudesPendientes = useMemo(
    () => solicitudesMedicos.filter((s) => s.estado === "pendiente"),
    [solicitudesMedicos]
  );

  const value = useMemo(
    () => ({
      currentUser,
      pendingAuth,
      signUp,
      login,
      confirmCode,
      logout,
      users,
      solicitudesMedicos,
      solicitudesPendientes,
      aprobarMedico,
      rechazarMedico,
    }),
    [currentUser, pendingAuth, users, solicitudesMedicos, solicitudesPendientes]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
