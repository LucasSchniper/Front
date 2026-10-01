/**
 * Tipos del dominio de DECA.
 *
 * Las entidades reflejan lo que devuelve el backend (snake_case en las
 * columnas que vienen de la base) y las respuestas envuelven siempre el
 * `{ ok: true }` que chequea `request()` en services/api.ts.
 */

export type Rol = "administrador" | "medico" | "paciente";

/** Como nombra el backend a cada rol (difiere en "admin"). */
export type RolBackend = "administrador" | "medico" | "paciente" | "admin";

export interface Paciente {
  id: number | string;
  nombre: string;
  apellido: string;
  mail: string;
  dni?: string;
  fecha_nacimiento?: string;
  obra_social?: string | null;
  medico_id?: number | string | null;
  created_at?: string;
}

export interface Medico {
  id: number | string;
  nombre: string;
  apellido: string;
  mail: string;
  dni?: string;
  matricula?: string;
  created_at?: string;
}

export interface Admin {
  id: number | string;
  nombre: string;
  apellido: string;
  mail: string;
}

export interface Analisis {
  id: number | string;
  porcentaje: number | string;
  banda?: "alta" | "media" | "baja" | null;
  archivo_nombre?: string | null;
  fecha_hora_entrega: string;
  paciente_id?: number | string;
  aprobado?: boolean;
  /** false mientras el médico no se lo mande al paciente. */
  enviado?: boolean;
}

export interface Mensaje {
  id: number | string;
  emisor: Rol | string;
  contenido: string | null;
  eliminado?: boolean;
  fecha_hora_entrega: string;
}

/** Con quién puede chatear el admin, y quién le puede responder. */
export type TipoContraparte = "paciente" | "medico" | "admin";

/** Resumen de una conversación con un admin, tal como la lista el backend. */
export interface ConversacionAdmin {
  /** Presentes cuando quien pide es el admin. */
  usuario_tipo?: "paciente" | "medico";
  usuario_id?: number | string;
  /** Presente cuando quien pide es un paciente o un médico. */
  admin_id?: number | string;
  nombre: string;
  apellido: string;
  ultimo_mensaje_en: string;
}

export interface Notificacion {
  id: number | string;
  contenido: string;
  fecha_hora_entrega: string;
  leida?: boolean;
}

/** Datos que el proveedor de OAuth ya nos dio antes de completar el registro. */
export interface PerfilOAuth {
  nombre: string;
  apellido?: string;
  email: string;
}

export type Provider = "google";

/** Sesión que guardamos en localStorage y expone el AuthContext. */
export interface Session {
  id: number | string;
  role: Rol;
  email: string;
  nombre?: string;
  apellido?: string;
}

/** Solicitud de registro de un médico, pendiente de aprobación del admin. */
export interface SolicitudMedico {
  id: number | string;
  email: string;
  nombre: string;
  apellido: string;
  dni?: string;
  matricula?: string;
  fecha?: string;
}



/** Todas las respuestas del backend traen `ok`. */
export interface RespuestaOk {
  ok: true;
}

export interface RespuestaAuth extends RespuestaOk {
  /** true cuando el usuario todavía no completó el registro. */
  isNew?: boolean;
  regToken?: string;
  perfil?: PerfilOAuth;
  token?: string;
  rol?: RolBackend;
  /** Médico pendiente de que el administrador apruebe su matrícula. */
  pendingApproval?: boolean;
  paciente?: Paciente;
  medico?: Medico;
  admin?: Admin;
}

export type RespuestaPerfilPaciente = RespuestaOk & { paciente: Paciente };
export type RespuestaPerfilMedico = RespuestaOk & { medico: Medico };
export type RespuestaPerfilAdmin = RespuestaOk & { admin: Admin };
export type RespuestaPacientes = RespuestaOk & { pacientes: Paciente[] };
export type RespuestaPaciente = RespuestaOk & { paciente: Paciente };
export type RespuestaMedicos = RespuestaOk & { medicos: Medico[] };
export type RespuestaAnalisis = RespuestaOk & { analisis: Analisis[] };
export type RespuestaUnAnalisis = RespuestaOk & { analisis: Analisis };
export type RespuestaNuevoAnalisis = RespuestaOk & {
  analisis: Analisis;
  interpretacion?: { texto?: string } | null;
};
export type RespuestaMensajes = RespuestaOk & { mensajes: Mensaje[] };
export type RespuestaMensaje = RespuestaOk & { mensaje: Mensaje };
export type RespuestaConversacionesAdmin = RespuestaOk & { conversaciones: ConversacionAdmin[] };
export type RespuestaNotificaciones = RespuestaOk & { notificaciones: Notificacion[] };

/* ------------------------------------------------------- Formularios ---- */

export type SignupField =
  | "nombreCompleto"
  | "mail"
  | "contrasena"
  | "fechaNacimiento"
  | "role"
  | "dni"
  | "obraSocial"
  | "obraSocialOtra"
  | "credencial"
  | "matricula";

export type SignupForm = Record<SignupField, string>;

export type SignupErrors = Partial<Record<SignupField, string>>;

export interface SignupValidation {
  errors: SignupErrors;
  missing: string[];
  ok: boolean;
}
