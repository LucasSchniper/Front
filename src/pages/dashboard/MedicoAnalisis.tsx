import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../services/api";
import { IconEcgUpload, IconCheck } from "../../components/icons/Icons";
import { mensajeDeError } from "../../utils/errors";
import EnviarAnalisis from "../../components/EnviarAnalisis";
import type { Analisis, Paciente } from "../../types";

/** Vercel corta los requests de más de 4.5 MB: avisamos antes de subirlo. */
const TAMANO_MAXIMO = 4 * 1024 * 1024;

/**
 * Carga de un analisis de ECG. El back guarda el archivo y calcula el
 * porcentaje (por ahora al azar, hasta que esté la IA).
 */
function MedicoAnalisis() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const [pacienteId, setPacienteId] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [notas, setNotas] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<Analisis | null>(null);

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
        if (!cancelado) setErrorCarga(mensajeDeError(err));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setResultado(null);

    if (!pacienteId) return setError("Elegí un paciente.");
    if (!archivo) return setError("Subí el archivo del ECG.");
    if (archivo.size > TAMANO_MAXIMO) return setError("El archivo no puede superar los 4 MB.");

    const datos = new FormData();
    datos.append("archivo", archivo);
    datos.append("pacienteId", pacienteId);

    setEnviando(true);
    try {
      const { analisis } = await api.analisis.realizar(datos);
      setResultado(analisis);
      setArchivo(null);
      setNotas("");
    } catch (err) {
      setError(mensajeDeError(err));
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
      <p className="page-subtitle">Subí un electrocardiograma y el sistema calcula el resultado.</p>

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
          <label htmlFor="analisis-notas">Notas (opcional)</label>
          <textarea
            id="analisis-notas"
            rows={3}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn--primary" disabled={enviando}>
          {enviando ? "Analizando…" : "Analizar"}
        </button>

        {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
        {resultado && (
          <div className="auth-card__feedback auth-card__feedback--success analisis-resultado">
            <p>
              <IconCheck size={16} /> Análisis guardado: posibilidad de Chagas{" "}
              {Number(resultado.porcentaje).toFixed(2)}%.
            </p>
            {resultado.enviado === false ? (
              <>
                <p className="analisis-resultado__nota">
                  Todavía no se lo enviaste. ¿Querés mandárselo al paciente?
                </p>
                <div className="analisis-resultado__acciones">
                  <EnviarAnalisis analisis={resultado} onEnviado={setResultado} />
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setResultado(null)}>
                    No enviar por ahora
                  </button>
                </div>
              </>
            ) : (
              <p className="analisis-resultado__nota">Se lo enviaste al paciente.</p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default MedicoAnalisis;
