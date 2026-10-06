import HeroHeartEcg from "./HeroHeartEcg";
import Reveal from "./Reveal";

function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="container hero__grid">
        <Reveal className="hero__text">
          <h1>
            Inteligencia artificial que analiza tu corazón.
            <span className="hero__accent">Detecta Chagas.</span>
          </h1>
          <div className="hero__rule" role="presentation" />
          <p className="hero__lead">
            Analizamos tu electrocardiograma con IA para detectar la posible
            presencia de Chagas de forma rápida y confiable
          </p>
        </Reveal>

        <Reveal delay={120} className="hero__visual">
          <HeroHeartEcg />
        </Reveal>
      </div>
    </section>
  );
}

export default Hero;
