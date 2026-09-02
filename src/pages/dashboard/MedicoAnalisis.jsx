import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { IconEcgUpload, IconCheck } from "../../components/icons/Icons";

/**
 * Carga de un analisis de ECG.
 *
 * Limitacion del backend actual: `POST /analisis` solo acepta
 * `{ pacienteId, porcentaje }` y la tabla `analisis` no tiene columna de
 * archivo ni de medico. Es decir, el ECG en si todavia no se puede guardar y
 * el porcentaje lo tiene que informar el medico a mano.
 *
 * Guardamos igual el objeto File en estado (no solo el nombre) para que, en
 * cuanto el back tenga storage, sea solo cambiar el body por un FormData:
 *   const fd = new FormData();
 *   fd.append("ecg", archivo);
 *   fd.append("pacienteId", pacienteId);
 *   await api.analisis.realizar(fd);   // request() ya soporta FormData
 */
function MedicoAnalisis() {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const [pacienteId, setPacienteId] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [porcentaje, setPorcentaje] = useState("");
  const [notas, setNotas] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelado = false;
    api.usuarios
      .listar()
      .then((data) => {
        if (cancelado) return;
        setPacientes(data.pacientes);
        setPacienteId((actual) => actual || String(data.pacientes[0]?.id ?? ""));
      })
      .catch((err) => {
        if (!cancelado) setErrorCarga(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDone(false);

    if (!pacienteId) return setError("Elegí un paciente.");
    if (!archivo) return setError("Subí el archivo del ECG.");

    // El back valida `typeof porcentaje === 'number'`, asi que hay que
    // mandarlo casteado: un string devuelve 400.
    const valor = Number(porcentaje);
    if (porcentaje === "" || !Number.isFinite(valor) || valor < 0 || valor > 100) {
      return setError("El porcentaje debe ser un número entre 0 y 100.");
    }

    setEnviando(true);
    try {
      await api.analisis.realizar({ pacienteId: Number(pacienteId), porcentaje: valor });
      setDone(true);
      setArchivo(null);
      setPorcentaje("");
      setNotas("");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div>
        <h1 className="page-title">Realizar análisis</h1>
        <p className="empty-state">Cargando pacientes…</p>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div>
        <h1 className="page-title">Realizar análisis</h1>
        <p className="auth-card__feedback auth-card__feedback--error">{errorCarga}</p>
      </div>
    );
  }

  if (pacientes.length === 0) {
    return (
      <div>
        <h1 className="page-title">Realizar análisis</h1>
        <p className="empty-state">Todavía no hay pacientes registrados en la plataforma.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Realizar análisis</h1>
      <p className="page-subtitle">Cargá un electrocardiograma y su resultado.</p>

      <form className="panel-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="analisis-paciente">Paciente</label>
          <select
            id="analisis-paciente"
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
          >
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellido} — DNI {p.dni}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="analisis-ecg">Archivo de ECG</label>
          <label className="file-drop" htmlFor="analisis-ecg">
            <IconEcgUpload size={22} />
            <span>{archivo?.name || "Elegir archivo (.pdf, .png, .csv)"}</span>
          </label>
          <input
            id="analisis-ecg"
            type="file"
            accept=".pdf,.png,.jpg,.csv"
            className="visually-hidden"
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="analisis-porcentaje">Posibilidad de Chagas (%)</label>
          <input
            id="analisis-porcentaje"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            required
          />
          <small className="form-field__hint">
            Provisorio: hasta que el análisis por IA esté en el servidor, el resultado se carga a
            mano. El archivo todavía no se almacena.
          </small>
        </div>

        <div className="form-field">
          <label htmlFor="analisis-notas">Notas (opcional)</label>
          <textarea
            id="analisis-notas"
            rows={3}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn--primary" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar análisis"}
        </button>

        {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
        {done && (
          <p className="auth-card__feedback auth-card__feedback--success">
            <IconCheck size={16} /> Análisis guardado en la historia clínica del paciente.
          </p>
        )}
      </form>
    </div>
  );
}

export default MedicoAnalisis;
