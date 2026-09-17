import type {
  Provider,
  RespuestaAnalisis,
  RespuestaAuth,
  RespuestaMedicos,
  RespuestaMensaje,
  RespuestaMensajes,
  RespuestaNotificaciones,
  RespuestaOk,
  RespuestaPaciente,
  RespuestaPacientes,
  RespuestaPerfilAdmin,
  RespuestaPerfilMedico,
  RespuestaPerfilPaciente,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");
const TOKEN_KEY = "deca_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export type ApiErrorKind = "network" | "auth" | "server";

/**
 * Error de API con el motivo tipado, para que quien llama pueda distinguir
 * "el server me rechazo" de "no llegue al server".
 *   network -> no hubo respuesta (back caido, sin internet, CORS)
 *   auth    -> 401/403, credenciales o token invalidos
 *   server  -> cualquier otro error con respuesta (400, 404, 5xx)
 */
export class ApiError extends Error {
  readonly kind?: ApiErrorKind;
  readonly status?: number;

  constructor(message: string, { kind, status }: { kind?: ApiErrorKind; status?: number } = {}) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

async function request<T extends RespuestaOk>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {}
): Promise<T> {
  // Con FormData el Content-Type lo pone el browser (necesita el boundary).
  const esForm = typeof FormData !== "undefined" && body instanceof FormData;
  const headers: Record<string, string> = esForm ? {} : { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: esForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. ¿Está corriendo el backend?", {
      kind: "network",
    });
  }

  const data: (T & { error?: string }) | null = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    const kind: ApiErrorKind = res.status === 401 || res.status === 403 ? "auth" : "server";
    throw new ApiError(data?.error || `Error ${res.status} al conectar con el servidor.`, {
      kind,
      status: res.status,
    });
  }

  return data;
}

type Id = number | string;

export interface CompletarRegistroPayload {
  regToken: string;
  role: string;
  dni?: string;
  fechaNacimiento?: string;
  obraSocial?: string;
  matricula?: string;
}

export interface EnviarMensajePayload {
  contenido: string;
  pacienteId?: Id;
  medicoId?: Id;
}

export interface RealizarAnalisisPayload {
  pacienteId: number;
  porcentaje: number;
}

export const api = {
  auth: {
    iniciar: (provider: Provider, credential: string | undefined): Promise<RespuestaAuth> =>
      request(`/auth/${provider}`, { method: "POST", body: { credential }, auth: false }),
    completarRegistro: (payload: CompletarRegistroPayload): Promise<RespuestaAuth> =>
      request("/auth/completar-registro", { method: "POST", body: payload, auth: false }),
  },
  admins: {
    perfil: (): Promise<RespuestaPerfilAdmin> => request("/admins/perfil"),
  },
  usuarios: {
    perfil: (): Promise<RespuestaPerfilPaciente> => request("/usuarios/perfil"),
    listar: (): Promise<RespuestaPacientes> => request("/usuarios"),
    asignarMedico: (id: Id, medicoId: Id | null): Promise<RespuestaPaciente> =>
      request(`/usuarios/${id}/medico`, { method: "PUT", body: { medicoId } }),
  },
  medicos: {
    perfil: (): Promise<RespuestaPerfilMedico> => request("/medicos/perfil"),
    listar: (): Promise<RespuestaMedicos> => request("/medicos"),
    pendientes: (): Promise<RespuestaMedicos> => request("/medicos/pendientes"),
    aprobar: (id: Id): Promise<RespuestaOk> => request(`/medicos/${id}/aprobar`, { method: "PUT" }),
    eliminar: (id: Id): Promise<RespuestaOk> => request(`/medicos/${id}`, { method: "DELETE" }),
  },
  mensajes: {
    conversacion: (contraparteId: Id): Promise<RespuestaMensajes> =>
      request(`/mensajes/${contraparteId}`),
    enviar: (payload: EnviarMensajePayload | FormData): Promise<RespuestaMensaje> =>
      request("/mensajes", { method: "POST", body: payload }),
    editar: (id: Id, contenido: string): Promise<RespuestaMensaje> =>
      request(`/mensajes/${id}`, { method: "PUT", body: { contenido } }),
    eliminar: (id: Id): Promise<RespuestaOk> => request(`/mensajes/${id}`, { method: "DELETE" }),
  },
  notificaciones: {
    listar: (): Promise<RespuestaNotificaciones> => request("/notificaciones"),
    marcarLeida: (id: Id): Promise<RespuestaOk> =>
      request(`/notificaciones/${id}/leida`, { method: "PUT" }),
  },
  analisis: {
    realizar: (payload: RealizarAnalisisPayload | FormData): Promise<RespuestaOk> =>
      request("/analisis", { method: "POST", body: payload }),
    listarPropios: (): Promise<RespuestaAnalisis> => request("/analisis"),
    listarDePaciente: (pacienteId: Id): Promise<RespuestaAnalisis> =>
      request(`/analisis/${pacienteId}`),
  },
};
