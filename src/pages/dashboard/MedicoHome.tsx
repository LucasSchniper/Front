import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSesion } from "../../context/AuthContext";
import { api } from "../../services/api";
import { mensajeDeError } from "../../utils/errors";
import type { Analisis, Paciente } from "../../types";
import { IconUserCircle, IconSearch, IconUpload, IconCheck } from "../../components/icons/Icons";
import RevisarAnalisis from "../../components/RevisarAnalisis";

/** Vercel corta los requests de más de 4.5 MB: avisamos antes de subirlo. */
const TAMANO_MAXIMO = 4 * 1024 * 1024;

function fechaCorta(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function horaCorta(iso: string) {
  return iso.slice(11, 16);
}

function MedicoHome() {
  const currentUser = useSesion();
  const [misPacientes, setMisPacientes] = useState<Paciente[]>([]);
  const [misAnalisis, setMisAnalisis] = useState<Analisis[]>([]);
  const [errorCarga, setErrorCarga] = useState("");

  const [query, setQuery] = useState("");
  const pacientesFiltrados = misPacientes.filter((p) =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const [pacienteId, setPacienteId] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<Analisis | null>(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let cancelado = false;
    Promise.all([api.usuarios.listar(), api.analisis.listarPropios()])
      .then(([pacientes, analisis]) => {
        if (cancelado) return;
        setMisPacientes(pacientes.pacientes);
        setPacienteId((actual) => actual || String(pacientes.pacientes[0]?.id ?? ""));
        setMisAnalisis(analisis.analisis);
      })
      .catch((err) => {
        if (!cancelado) setErrorCarga(mensajeDeError(err));
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const actualizarAnalisis = (actualizado: Analisis) => {
    setMisAnalisis((prev) => prev.map((a) => (a.id === actualizado.id ? actualizado : a)));
    setResultado((actual) => (actual?.id === actualizado.id ? actualizado : actual));
  };

  const quitarAnalisis = (eliminado: Analisis) => {
    setMisAnalisis((prev) => prev.filter((a) => a.id !== eliminado.id));
    setResultado((actual) => (actual?.id === eliminado.id ? null : actual));
    setAviso("Rechazaste el resultado: el análisis se eliminó.");
  };

  const nombrePaciente = (id: Analisis["paciente_id"]) => {
    const p = misPacientes.find((x) => String(x.id) === String(id));
    return p ? `${p.nombre} ${p.apellido}` : "—";
  };

  const handleAnalizar = async () => {
    setError("");
    setAviso("");
    setResultado(null);
    if (!pacienteId) return setError("Elegí un paciente.");
    if (!archivo) return setError("Elegí el archivo del ECG.");
    if (archivo.size > TAMANO_MAXIMO) return setError("El archivo no puede superar los 4 MB.");

    const datos = new FormData();
    datos.append("archivo", archivo);
    datos.append("pacienteId", pacienteId);

    setLoading(true);
    try {
      const { analisis } = await api.analisis.realizar(datos);
      setResultado(analisis);
      setMisAnalisis((prev) => [analisis, ...prev]);
      setArchivo(null);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setLoading(false);
    }
  };

  const nombreDoctor = currentUser.nombre
    ? `${currentUser.nombre} ${currentUser.apellido || ""}`.trim()
    : currentUser.email.split("@")[0];

  return (
    <div>
      <h1 className="page-title">¡Bienvenido, Dr./Dra. {nombreDoctor}!</h1>
      <p className="page-subtitle">Gestioná tus pacientes y análisis de ECG.</p>
      {errorCarga && <p className="auth-card__feedback auth-card__feedback--error">{errorCarga}</p>}

      <div className="medico-home__grid">
        <div className="dash-card">
          <div className="dash-card__header">
            <IconUserCircle size={20} />
            <h2>Pacientes</h2>
          </div>

          <label className="dash-search">
            <IconSearch size={16} />
            <input
              type="search"
              placeholder="Buscar pacientes"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <ul className="dash-patient-list">
            {pacientesFiltrados.length === 0 && (
              <li className="empty-state">
                {misPacientes.length === 0 ? "Todavía no tenés pacientes asignados." : "Sin pacientes que coincidan."}
              </li>
            )}
            {pacientesFiltrados.map((p) => (
              <li key={p.id}>
                <Link to="/medico/pacientes" className="dash-patient-row">
                  <IconUserCircle size={26} />
                  <span>
                    {p.nombre} {p.apellido}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <IconUpload size={20} />
            <h2>Realizar nuevo análisis</h2>
          </div>

          <div className="form-field">
            <label htmlFor="home-paciente" className="visually-hidden">
              Paciente
            </label>
            <select
              id="home-paciente"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              disabled={misPacientes.length === 0}
            >
              {misPacientes.length === 0 && <option value="">Sin pacientes asignados</option>}
              {misPacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
            </select>
          </div>

          <label className="dash-dropzone" htmlFor="home-ecg-file">
            <span className="btn btn--ghost btn--sm">{archivo?.name || "Seleccionar archivo"}</span>
          </label>
          <input
            id="home-ecg-file"
            type="file"
            accept=".pdf,.png,.jpg,.csv"
            className="visually-hidden"
            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          />

          <button
            type="button"
            className="btn btn--primary dash-card__cta"
            disabled={!archivo || !pacienteId || loading}
            onClick={handleAnalizar}
          >
            {loading ? "Analizando…" : "Analizar ECG"}
          </button>

          {error && <p className="auth-card__feedback auth-card__feedback--error">{error}</p>}
          {aviso && <p className="auth-card__feedback">{aviso}</p>}
          {resultado && (
            <div className="auth-card__feedback auth-card__feedback--success analisis-resultado">
              <p>
                <IconCheck size={16} /> Resultado de la IA para {nombrePaciente(resultado.paciente_id)}:
                posibilidad de Chagas {Number(resultado.porcentaje).toFixed(2)}%.
              </p>
              {resultado.enviado === false ? (
                <>
                  <p className="analisis-resultado__nota">
                    {resultado.aprobado === false
                      ? "Revisá el resultado antes de decidir si se lo enviás al paciente."
                      : "Aprobaste el resultado. ¿Querés mandárselo al paciente?"}
                  </p>
                  <div className="analisis-resultado__acciones">
                    <RevisarAnalisis analisis={resultado} onActualizado={actualizarAnalisis} onEliminado={quitarAnalisis} />
                    {resultado.aprobado !== false && (
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setResultado(null)}>
                        No enviar por ahora
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="analisis-resultado__nota">Se lo enviaste al paciente.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="results-table">
        <div className="results-table__row results-table__row--envio results-table__row--head">
          <span>Paciente</span>
          <span>Resultado</span>
          <span>Fecha</span>
          <span>Hora</span>
          <span>Revisión</span>
        </div>
        {misAnalisis.length === 0 && <p className="empty-state">Todavía no hay análisis cargados.</p>}
        {misAnalisis.map((a) => (
          <div className="results-table__row results-table__row--envio" key={a.id}>
            <span className="results-table__patient">
              <IconUserCircle size={22} />
              {nombrePaciente(a.paciente_id)}
            </span>
            <span>{Number(a.porcentaje).toFixed(2)}%</span>
            <span>{fechaCorta(a.fecha_hora_entrega)}</span>
            <span>{horaCorta(a.fecha_hora_entrega)}hs</span>
            <span>
              <RevisarAnalisis analisis={a} onActualizado={actualizarAnalisis} onEliminado={quitarAnalisis} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicoHome;
