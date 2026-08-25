import { useState } from "react";
import Reveal from "./Reveal";

const SECTIONS = [
  {
    title: "¿Qué es?",
    body: "La enfermedad de Chagas es causada por el parásito Trypanosoma cruzi. Es endémica en 21 países de América Latina, aunque por migración y otras vías de transmisión hoy se diagnostica también en Norteamérica, Europa y el Pacífico Occidental.",
  },
  {
    title: "Transmisión",
    body: "Principalmente vectorial, por contacto con heces de triatominos infectados (‘vinchuca’). También puede transmitirse por vía congénita (madre a hijo), transfusión de sangre, trasplante de órganos, e ingesta de alimentos contaminados con el parásito.",
  },
  {
    title: "Fases clínicas",
    body: "Fase aguda: dura semanas o meses, suele ser leve o asintomática (a veces con fiebre, chagoma o signo de Romaña). Fase crónica: puede permanecer indeterminada por años y, en un 20-30% de los casos, evolucionar a compromiso cardíaco y/o digestivo décadas después.",
  },
  {
    title: "Diagnóstico",
    body: "En fase aguda se recurre a métodos parasitológicos directos (gota fresca, Strout, PCR). En fase crónica se requieren al menos dos pruebas serológicas con técnicas distintas (ELISA, HAI o IFI) para confirmar el diagnóstico.",
  },
  {
    title: "Tratamiento",
    body: "Benznidazol y Nifurtimox son los antiparasitarios disponibles, con mayor eficacia en fase aguda, en infección congénita y en niños. En fase crónica, el seguimiento cardiológico y digestivo es central en el manejo del paciente.",
  },
];

function ChagasInfo() {
  const [active, setActive] = useState(0);

  return (
    <section id="chagas" className="chagas">
      <div className="container">
        <Reveal as="div" className="section-heading">
          <p className="eyebrow">Para el equipo de salud</p>
          <h2>Lo esencial sobre la enfermedad de Chagas</h2>
          <p className="section-lead">
            Un resumen clínico rápido, pensado como referencia inicial dentro
            de DECA. No reemplaza las guías clínicas oficiales.
          </p>
        </Reveal>

        <div className="accordion">
          {SECTIONS.map((section, index) => {
            const isOpen = active === index;
            return (
              <Reveal as="div" key={section.title} delay={index * 60} className="accordion__item-wrap">
                <div className={`accordion__item ${isOpen ? "accordion__item--open" : ""}`}>
                  <button
                    className="accordion__trigger"
                    onClick={() => setActive(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="accordion__number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="accordion__title">{section.title}</span>
                    <span className="accordion__icon">{isOpen ? "−" : "+"}</span>
                  </button>
                  <div className="accordion__panel">
                    <p>{section.body}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ChagasInfo;
