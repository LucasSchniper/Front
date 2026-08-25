import Reveal from "./Reveal";
import { UNIT_PATH } from "./EcgLine";
import { IconHeartCheck, IconPulse, IconUpload } from "./icons/Icons";

const PASOS = [
  {
    icon: IconUpload,
    title: "Se carga el electrocardiograma",
    body: "El médico sube el ECG del paciente desde su panel. No hace falta ningún equipo extra: sirve el estudio que ya se hace en el centro de salud.",
  },
  {
    icon: IconPulse,
    title: "El modelo lee el trazado",
    body: "La IA busca en el ritmo los patrones asociados a la cardiopatía chagásica y devuelve una probabilidad, no un diagnóstico cerrado.",
  },
  {
    icon: IconHeartCheck,
    title: "El profesional confirma",
    body: "El médico revisa el resultado, lo cruza con la serología y define la conducta. La última palabra siempre es de una persona.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="how">
      <div className="container">
        <Reveal as="div" className="section-heading">
          <p className="eyebrow">Cómo funciona</p>
          <h2>Del electro al resultado, en tres pasos</h2>
        </Reveal>

        <div className="how__steps">
          <svg className="how__trace" viewBox="0 0 900 100" preserveAspectRatio="none" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <path key={i} d={UNIT_PATH} transform={`translate(${300 * i},0)`} />
            ))}
          </svg>

          {PASOS.map(({ icon: Icon, title, body }, i) => (
            <Reveal as="article" key={title} delay={i * 110} className="how__step">
              <span className="how__badge">
                <Icon size={22} />
                <span className="how__number">{i + 1}</span>
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
