import type { Analisis } from "../types";

/**
 * Cómo se muestra el resultado del modelo. La banda va siempre antes que el
 * percentil: un `no_alta` puede tener percentil 97 y leído solo suena a urgencia.
 * `no_alta` no es "normal": no descarta Chagas, por eso no va en verde.
 */
const BANDAS = {
  alta: { etiqueta: "Prioridad alta", clase: "positivo" },
  no_alta: { etiqueta: "Sin prioridad por ECG", clase: "neutro" },
} as const;

const SIN_BANDA = { etiqueta: "Sin clasificar", clase: "seguimiento" } as const;

export function bandaDe(analisis: Pick<Analisis, "banda">) {
  return (analisis.banda && BANDAS[analisis.banda]) || SIN_BANDA;
}

/** `porcentaje` es el percentil de riesgo, no una probabilidad de tener Chagas. */
export function percentilDe(analisis: Pick<Analisis, "porcentaje">) {
  return `percentil ${Math.round(Number(analisis.porcentaje))}`;
}

export const ADVERTENCIA_TAMIZAJE =
  "Resultado de tamizaje: indica prioridad para la prueba serológica de Chagas, no " +
  "diagnostica cardiopatía chagásica ni reemplaza la evaluación clínica.";
