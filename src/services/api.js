const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");
const TOKEN_KEY = "deca_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Error de API con el motivo tipado, para que quien llama pueda distinguir
 * "el server me rechazo" de "no llegue al server".
 *   network -> no hubo respuesta (back caido, sin internet, CORS)
 *   auth    -> 401/403, credenciales o token invalidos
 *   server  -> cualquier otro error con respuesta (400, 404, 5xx)
 */
export class ApiError extends Error {
  constructor(message, { kind, status } = {}) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  // Con FormData el Content-Type lo pone el browser (necesita el boundary).
  const esForm = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = esForm ? {} : { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
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

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    const kind = res.status === 401 || res.status === 403 ? "auth" : "server";
    throw new ApiError(data?.error || `Error ${res.status} al conectar con el servidor.`, {
      kind,
      status: res.status,
    });
  }

  return data;
}

export const api = {
  admins: {
    login: (payload) => request("/api/admins/login", { method: "POST", body: payload, auth: false }),
    perfil: () => request("/api/admins/perfil"),
  },
  usuarios: {
    registro: (payload) => request("/api/usuarios/registro", { method: "POST", body: payload, auth: false }),
    login: (payload) => request("/api/usuarios/login", { method: "POST", body: payload, auth: false }),
    perfil: () => request("/api/usuarios/perfil"),
    listar: () => request("/api/usuarios"),
  },
  medicos: {
    registro: (payload) => request("/api/medicos/registro", { method: "POST", body: payload, auth: false }),
    login: (payload) => request("/api/medicos/login", { method: "POST", body: payload, auth: false }),
    perfil: () => request("/api/medicos/perfil"),
    listar: () => request("/api/medicos"),
    pendientes: () => request("/api/medicos/pendientes"),
    aprobar: (id) => request(`/api/medicos/${id}/aprobar`, { method: "PUT" }),
    eliminar: (id) => request(`/api/medicos/${id}`, { method: "DELETE" }),
  },
  mensajes: {
    conversacion: (contraparteId) => request(`/api/mensajes/${contraparteId}`),
    enviar: (payload) => request("/api/mensajes", { method: "POST", body: payload }),
    editar: (id, contenido) => request(`/api/mensajes/${id}`, { method: "PUT", body: { contenido } }),
    eliminar: (id) => request(`/api/mensajes/${id}`, { method: "DELETE" }),
  },
  notificaciones: {
    listar: () => request("/api/notificaciones"),
    marcarLeida: (id) => request(`/api/notificaciones/${id}/leida`, { method: "PUT" }),
  },
  analisis: {
    realizar: (payload) => request("/api/analisis", { method: "POST", body: payload }),
    listarPropios: () => request("/api/analisis"),
    listarDePaciente: (pacienteId) => request(`/api/analisis/${pacienteId}`),
  },
};
