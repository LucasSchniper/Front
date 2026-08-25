import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { MOCK_PACIENTES } from "../../data/mockData";
import { IconEcgUpload, IconCheck } from "../../components/icons/Icons";

const DEMO_DOCTOR_EMAIL = "medico@deca.com";

function MedicoAnalisis() {
  const { currentUser } = useAuth();
  const isDemoDoctor = currentUser.email === DEMO_DOCTOR_EMAIL;
  const pacientes = isDemoDoctor ? MOCK_PACIENTES.filter((p) => p.medicoId === "m1") : [];

  const [pacienteId, setPacienteId] = useState(pacientes[0]?.id || "");
  const [fileName, setFileName] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pacienteId || !fileName) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
      setFileName("");
      setNotas("");
    }, 1200);
  };

  if (pacientes.length === 0) {
    return (
      <div>
        <h1 className="page-title">Realizar análisis</h1>
        <p className="empty-state">Necesitás tener pacientes asignados para poder subir un ECG.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Realizar análisis</h1>
      <p className="page-subtitle">Subí un electrocardiograma para analizarlo con IA.</p>

      <form className="panel-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="analisis-paciente">Paciente</label>
          <select id="analisis-paciente" value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="analisis-ecg">Archivo de ECG</label>
          <label className="file-drop" htmlFor="analisis-ecg">
            <IconEcgUpload size={22} />
            <span>{fileName || "Elegir archivo (.pdf, .png, .csv)"}</span>
          </label>
          <input
            id="analisis-ecg"
            type="file"
            accept=".pdf,.png,.jpg,.csv"
            className="visually-hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            required
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

        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Analizando…" : "Analizar y guardar"}
        </button>

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
