import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth, useSesion } from "../../context/AuthContext";
import { api, type ActualizarPerfilPayload } from "../../services/api";
import { IconUserCircle } from "../../components/icons/Icons";
import { mensajeDeError } from "../../utils/errors";
import type { Admin, Medico, Paciente, Rol } from "../../types";

type Datos = Paciente | Medico | Admin;

interface Formulario {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  obraSocial: string;
  matricula: string;
}

/** Cada rol tiene su propio endpoint de perfil y devuelve la entidad en una clave distinta. */
const PERFIL_POR_ROL: Record<
  Rol,
  {
    obtener: () => Promise<Datos>;
    actualizar: (payload: ActualizarPerfilPayload) => Promise<Datos>;
  }
> = {
  paciente: {
    obtener: () => api.usuarios.perfil().then((d) => d.paciente),
    actualizar: (p) => api.usuarios.actualizarPerfil(p).then((d) => d.paciente),
  },
  medico: {
    obtener: () => api.medicos.perfil().then((d) => d.medico),
    actualizar: (p) => api.medicos.actualizarPerfil(p).then((d) => d.medico),
  },
  administrador: {
    obtener: () => api.admins.perfil().then((d) => d.admin),
    actualizar: (p) => api.admins.actualizarPerfil(p).then((d) => d.admin),
  },
};

function formularioDesde(datos: Datos): Formulario {
  return {
    nombre: datos.nombre ?? "",
    apellido: datos.apellido ?? "",
    dni: ("dni" in datos && datos.dni) || "",
    // La base guarda DATE; el input necesita YYYY-MM-DD.
    fechaNacimiento: ("fecha_nacimiento" in datos && datos.fecha_nacimiento?.slice(0, 10)) || "",
    obraSocial: ("obra_social" in datos && datos.obra_social) || "",
    matricula: ("matricula" in datos && datos.matricula) || "",
  };
}

function payloadDesde(rol: Rol, form: Formulario): ActualizarPerfilPayload {
  const base = { nombre: form.nombre.trim(), apellido: form.apellido.trim() };
  if (rol === "paciente") {
    return {
      ...base,
      dni: form.dni.trim(),
      fechaNacimiento: form.fechaNacimiento,
      obraSocial: form.obraSocial.trim(),
    };
  }
  if (rol === "medico") return { ...base, dni: form.dni.trim(), matricula: form.matricula.trim() };
  return base;
}

function Perfil() {
  const currentUser = useSesion();
  const { actualizarSesion } = useAuth();
  const rol = currentUser.role;
  const [datos, setDatos] = useState<Datos | null>(null);
  const [form, setForm] = useState<Formulario | null>(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError("");

    PERFIL_POR_ROL[rol]
      .obtener()
      .then((perfil) => {
        if (cancelado) return;
        setDatos(perfil);
        setForm(formularioDesde(perfil));
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeDeError(err));
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [rol]);

  const update = (campo: keyof Formulario) => (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setForm((prev) => (prev ? { ...prev, [campo]: valor } : prev));
    setExito("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;
    setError("");
    setExito("");
    setGuardando(true);
    try {
      const actualizado = await PERFIL_POR_ROL[rol].actualizar(payloadDesde(rol, form));
      setDatos(actualizado);
      setForm(formularioDesde(actualizado));
      actualizarSesion({ nombre: actualizado.nombre, apellido: actualizado.apellido });
      setExito("Tus datos se guardaron correctamente.");
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="page-title">Mi perfil</h1>
      <p className="page-subtitle">Tus datos personales y de acceso.</p>

      {loading && <p className="empty-state">Cargando…</p>}
      {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
      {exito && <p className="auth-card__feedback auth-card__feedback--success">{exito}</p>}

      {datos && form && (
        <form className="panel-form panel-form--centered" onSubmit={handleSubmit}>
          <div className="profile-photo">
            <span className="profile-photo__avatar">
              <IconUserCircle size={64} />
            </span>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="perfil-nombre">Nombre</label>
              <input id="perfil-nombre" value={form.nombre} onChange={update("nombre")} required />
            </div>
            <div className="form-field">
              <label htmlFor="perfil-apellido">Apellido</label>
              <input id="perfil-apellido" value={form.apellido} onChange={update("apellido")} required />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="perfil-mail">Mail</label>
            <input id="perfil-mail" type="email" value={datos.mail} disabled />
          </div>

          {rol !== "administrador" && (
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="perfil-dni">DNI</label>
                <input
                  id="perfil-dni"
                  inputMode="numeric"
                  value={form.dni}
                  onChange={update("dni")}
                  required
                />
              </div>
              {rol === "medico" && (
                <div className="form-field">
                  <label htmlFor="perfil-matricula">Matrícula</label>
                  <input id="perfil-matricula" value={form.matricula} onChange={update("matricula")} />
                </div>
              )}
              {rol === "paciente" && (
                <div className="form-field">
                  <label htmlFor="perfil-fecha">Fecha de nacimiento</label>
                  <input
                    id="perfil-fecha"
                    type="date"
                    value={form.fechaNacimiento}
                    onChange={update("fechaNacimiento")}
                    required
                  />
                </div>
              )}
            </div>
          )}

          {rol === "paciente" && (
            <div className="form-field">
              <label htmlFor="perfil-obra-social">Obra social</label>
              <input id="perfil-obra-social" value={form.obraSocial} onChange={update("obraSocial")} />
            </div>
          )}

          <p className="auth-card__hint">El mail no se puede modificar.</p>

          <button type="submit" className="btn btn--primary" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      )}
    </div>
  );
}

export default Perfil;
