import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IconUserCircle, IconSearch, IconUpload, IconCheck } from "../../components/icons/Icons";

function MedicoHome() {
  const { currentUser } = useAuth();
  // TODO(back): traer los pacientes asignados y los analisis del medico logueado.
  const misPacientes = [];
  const misAnalisis = [];

  const [query, setQuery] = useState("");
  const pacientesFiltrados = misPacientes.filter((p) =>
    p.nombre.toLowerCase().includes(query.trim().toLowerCase())
  );

  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const nombrePaciente = (id) => misPacientes.find((p) => p.id === id)?.nombre || "—";
  const fechaCorta = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const handleAnalizar = () => {
    if (!fileName) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setFileName("");
      setTimeout(() => setDone(false), 3000);
    }, 1200);
  };

  const nombreDoctor = currentUser.nombre
    ? `${currentUser.nombre} ${currentUser.apellido || ""}`.trim()
    : currentUser.email.split("@")[0];

  return (
    <div>
      <h1 className="page-title">¡Bienvenido, Dr./Dra. {nombreDoctor}!</h1>
      <p className="page-subtitle">Gestioná tus pacientes y análisis de ECG.</p>

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
              <li className="empty-state">Sin pacientes que coincidan.</li>
            )}
            {pacientesFiltrados.map((p) => (
              <li key={p.id}>
                <Link to="/medico/pacientes" className="dash-patient-row">
                  <IconUserCircle size={26} />
                  <span>{p.nombre}</span>
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

          <label className="dash-dropzone" htmlFor="home-ecg-file">
            <span className="btn btn--ghost btn--sm">
              {fileName || "Seleccionar archivo"}
            </span>
          </label>
          <input
            id="home-ecg-file"
            type="file"
            accept=".pdf,.png,.jpg,.csv"
            className="visually-hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
          />

          <button
            type="button"
            className="btn btn--primary dash-card__cta"
            disabled={!fileName || loading}
            onClick={handleAnalizar}
          >
            {loading ? "Analizando…" : "Analizar ECG"}
          </button>

          {done && (
            <p className="auth-card__feedback auth-card__feedback--success">
              <IconCheck size={16} /> Análisis guardado en la historia clínica.
            </p>
          )}
        </div>
      </div>

      <div className="results-table">
        <div className="results-table__row results-table__row--head">
          <span>Paciente</span>
          <span>Resultado</span>
          <span>Fecha</span>
          <span>Hora</span>
        </div>
        {misAnalisis.length === 0 && <p className="empty-state">Todavía no hay análisis cargados.</p>}
        {misAnalisis.map((a) => (
          <div className="results-table__row" key={a.id}>
            <span className="results-table__patient">
              <IconUserCircle size={22} />
              {nombrePaciente(a.pacienteId)}
            </span>
            <span>{a.resultado}%</span>
            <span>{fechaCorta(a.fecha)}</span>
            <span>{a.hora}hs</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedicoHome;
