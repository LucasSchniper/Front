import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ApiError,
  api,
  setToken,
  type CompletarRegistroPayload,
  type LoginPayload,
  type RegistroPayload,
} from "../services/api";
import { mensajeDeError } from "../utils/errors";
import type {
  Admin,
  Medico,
  Paciente,
  PerfilOAuth,
  Provider,
  RespuestaAuth,
  Rol,
  RolBackend,
  Session,
  SolicitudMedico,
} from "../types";

const SESSION_KEY = "deca_session";

function saveToken(token: string | null): void {
  try {
    setToken(token || null);
  } catch {}
}

function sessionFromPaciente(paciente: Paciente): Session {
  return {
    id: paciente.id,
    role: "paciente",
    email: paciente.mail,
    nombre: paciente.nombre,
    apellido: paciente.apellido,
  };
}

function sessionFromMedico(medico: Medico): Session {
  return {
    id: medico.id,
    role: "medico",
    email: medico.mail,
    nombre: medico.nombre,
    apellido: medico.apellido,
  };
}

function sessionFromAdmin(admin: Admin): Session {
  return {
    id: admin.id,
    role: "administrador",
    email: admin.mail,
    nombre: admin.nombre,
    apellido: admin.apellido,
  };
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

/** Resultado de un login/registro, para que la pantalla decida a dónde ir. */
export type AuthResultado =
  | {
      ok: true;
      isNew?: boolean;
      regToken?: string;
      perfil?: PerfilOAuth;
      provider?: Provider;
      pendingApproval?: boolean;
      role?: Rol;
    }
  | {
      ok: false;
      error: string;
      /** El back no conoce ese mail: la pantalla ofrece registrarlo. */
      cuentaInexistente?: boolean;
      /** Ya hay una cuenta con contraseña para ese mail. */
      mailEnUso?: boolean;
    };

export interface AuthContextValue {
  currentUser: Session | null;
  loginWithPassword: (payload: LoginPayload) => Promise<AuthResultado>;
  signupWithPassword: (payload: RegistroPayload) => Promise<AuthResultado>;
  loginWithOAuth: (provider: Provider, credential: string | undefined) => Promise<AuthResultado>;
  completeOAuthSignup: (payload: CompletarRegistroPayload) => Promise<AuthResultado>;
  logout: () => void;
  solicitudesPendientes: SolicitudMedico[];
  aprobarMedico: (id: Medico["id"]) => Promise<void>;
  rechazarMedico: (id: Medico["id"]) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSolicitud(medico: Medico): SolicitudMedico {
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

const ROL_FRONTEND: Record<string, Rol> = {
  paciente: "paciente",
  medico: "medico",
  admin: "administrador",
};

/** Cada rol del backend trae la entidad en una clave distinta de la respuesta. */
function sesionDesde(rol: RolBackend | string | undefined, data: RespuestaAuth): Session | null {
  switch (rol) {
    case "paciente":
      return data.paciente ? sessionFromPaciente(data.paciente) : null;
    case "medico":
      return data.medico ? sessionFromMedico(data.medico) : null;
    case "admin":
    case "administrador":
      return data.admin ? sessionFromAdmin(data.admin) : null;
    default:
      return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Session | null>(loadSession);
  const [solicitudesMedicos, setSolicitudesMedicos] = useState<SolicitudMedico[]>([]);

  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
  }, [currentUser]);

  const cargarSolicitudesPendientes = async (): Promise<void> => {
    try {
      const { medicos } = await api.medicos.pendientes();
      setSolicitudesMedicos(medicos.map(mapSolicitud));
    } catch {
    }
  };

  useEffect(() => {
    if (currentUser?.role === "administrador") cargarSolicitudesPendientes();
  }, [currentUser?.role]);

  /** Guarda token y sesión a partir de la respuesta del back (sirve para mail y para Google). */
  const iniciarSesion = (data: RespuestaAuth): AuthResultado => {
    if (data.pendingApproval) return { ok: true, pendingApproval: true };

    const session = sesionDesde(data.rol, data);
    if (!session) throw new Error("El servidor devolvió una sesión que no pudimos interpretar.");

    saveToken(data.token ?? null);
    setCurrentUser(session);
    return { ok: true, role: session.role };
  };

  const loginWithPassword = async ({ mail, contrasena }: LoginPayload): Promise<AuthResultado> => {
    try {
      return iniciarSesion(await api.auth.login({ mail: mail.trim(), contrasena }));
    } catch (err) {
      return {
        ok: false,
        error: mensajeDeError(err),
        cuentaInexistente: err instanceof ApiError && err.status === 404,
      };
    }
  };

  /**
   * Si el mail ya existe porque la cuenta se creó con Google, el back le agrega
   * la contraseña a esa misma cuenta en vez de crear otra.
   */
  const signupWithPassword = async (payload: RegistroPayload): Promise<AuthResultado> => {
    try {
      return iniciarSesion(await api.auth.registro({ ...payload, mail: payload.mail.trim() }));
    } catch (err) {
      return {
        ok: false,
        error: mensajeDeError(err),
        mailEnUso: err instanceof ApiError && err.status === 409,
      };
    }
  };

  const loginWithOAuth = async (
    provider: Provider,
    credential: string | undefined
  ): Promise<AuthResultado> => {
    try {
      const data = await api.auth.iniciar(provider, credential);

      if (data.isNew) {
        return { ok: true, isNew: true, regToken: data.regToken, perfil: data.perfil, provider };
      }

      return iniciarSesion(data);
    } catch (err) {
      return { ok: false, error: mensajeDeError(err) };
    }
  };

  const completeOAuthSignup = async ({
    regToken,
    role,
    ...extra
  }: CompletarRegistroPayload): Promise<AuthResultado> => {
    try {
      const data = await api.auth.completarRegistro({ regToken, role, ...extra });

      if (data.pendingApproval) {
        return { ok: true, pendingApproval: true };
      }

      const rolFrontend = ROL_FRONTEND[role] ?? (role as Rol);
      const session = sesionDesde(role, data);

      if (session) {
        saveToken(data.token ?? null);
        setCurrentUser(session);
      }

      return { ok: true, role: rolFrontend };
    } catch (err) {
      return { ok: false, error: mensajeDeError(err) };
    }
  };

  const logout = (): void => {
    saveToken(null);
    setCurrentUser(null);
  };

  const aprobarMedico = async (id: Medico["id"]): Promise<void> => {
    await api.medicos.aprobar(id);
    setSolicitudesMedicos((prev) => prev.filter((s) => s.id !== id));
  };

  const rechazarMedico = async (id: Medico["id"]): Promise<void> => {
    await api.medicos.eliminar(id);
    setSolicitudesMedicos((prev) => prev.filter((s) => s.id !== id));
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      loginWithPassword,
      signupWithPassword,
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

/**
 * Sesión garantizada, para las pantallas que viven detrás de <ProtectedRoute>
 * y por lo tanto sólo se montan con un usuario logueado.
 */
export function useSesion(): Session {
  const { currentUser } = useAuth();
  if (!currentUser) throw new Error("Esta pantalla necesita una sesión activa.");
  return currentUser;
}
