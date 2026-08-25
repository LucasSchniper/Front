import { Link } from "react-router-dom";
import EcgLine from "./EcgLine";
import HeroHeartEcg from "./HeroHeartEcg";
import Reveal from "./Reveal";
import { IconClock, IconHeartCheck, IconShield } from "./icons/Icons";

const ACCENT_TRACE =
  "M0,16 H52 L59,7 L65,22 L71,2 L77,20 L82,16 H176 L183,7 L189,22 L195,2 L201,20 L206,16 H300";

const PROMESAS = [
  { icon: IconClock, text: "Resultado en minutos" },
  { icon: IconHeartCheck, text: "Revisado por tu médico" },
  { icon: IconShield, text: "Tus datos, protegidos" },
];

function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="hero__circle hero__circle--a" />
      <div className="hero__circle hero__circle--b" />

      <div className="container hero__grid">
        <Reveal className="hero__text">
          <h1>
            Inteligencia artificial que analiza tu corazón.
            <span className="hero__accent">
              Detecta Chagas.
              <svg
                className="hero__accent-trace"
                viewBox="0 0 300 24"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d={ACCENT_TRACE} />
              </svg>
            </span>
          </h1>
          <p className="hero__lead">
            Analizamos tu electrocardiograma con IA para detectar la posible
            presencia de Chagas, de forma rápida y confiable.
          </p>
          <div className="hero__cta">
            <Link to="/signup" className="btn btn--primary">
              Registrarme gratis
            </Link>
            <a href="#como-funciona" className="btn btn--ghost">
              Ver cómo funciona
            </a>
          </div>

          <ul className="hero__promesas">
            {PROMESAS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={17} />
                {text}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="hero__visual">
          <HeroHeartEcg />
        </Reveal>
      </div>

      <div className="hero__ecg">
        <EcgLine height={90} />
      </div>
    </section>
  );
}

export default Hero;
