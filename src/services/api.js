const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");
const TOKEN_KEY = "deca_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. ¿Está corriendo el backend?");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Error ${res.status} al conectar con el servidor.`);
  }

  return data;
}

export const api = {
  usuarios: {
    registro: (payload) => request("/api/usuarios/registro", { method: "POST", body: payload, auth: false }),
    login: (payload) => request("/api/usuarios/login", { method: "POST", body: payload, auth: false }),
    perfil: () => request("/api/usuarios/perfil"),
    listar: () => request("/api/usuarios"),
  },
  medicos: {
    login: (payload) => request("/api/medicos/login", { method: "POST", body: payload, auth: false }),
    perfil: () => request("/api/medicos/perfil"),
    listar: () => request("/api/medicos"),
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
