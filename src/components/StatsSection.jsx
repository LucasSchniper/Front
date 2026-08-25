import Counter from "./Counter";
import EcgLine from "./EcgLine";
import Reveal from "./Reveal";

const STATS = [
  { to: 6, suffix: " a 7 M", label: "personas infectadas en el mundo (est. OMS)" },
  { to: 21, suffix: "", label: "países endémicos en América Latina" },
  { to: 30, suffix: "%", label: "desarrolla compromiso cardíaco a largo plazo" },
  { to: 10000, suffix: "+", label: "muertes estimadas por año" },
];

function StatsSection() {
  return (
    <section id="datos" className="stats">
      <EcgLine color="#fff" height={60} className="stats__ecg" />
      <div className="container">
        <Reveal as="div" className="section-heading section-heading--light">
          <p className="eyebrow">Datos clave</p>
          <h2>El Chagas en números</h2>
        </Reveal>

        <div className="stats__grid">
          {STATS.map((stat, i) => (
            <Reveal as="div" key={stat.label} delay={i * 100} className="stat-card">
              <div className="stat-card__number">
                <Counter to={stat.to} suffix={stat.suffix} />
              </div>
              <p className="stat-card__label">{stat.label}</p>
            </Reveal>
          ))}
        </div>

        <p className="stats__source">
          Fuente: Organización Mundial de la Salud y OPS, estimaciones sobre la
          enfermedad de Chagas.
        </p>
      </div>
    </section>
  );
}

export default StatsSection;
