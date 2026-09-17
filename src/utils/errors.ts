/**
 * En un `catch` el valor es `unknown`, asi que antes de mostrarlo en pantalla
 * hay que reducirlo a un texto. Los errores del backend llegan como ApiError
 * (que es un Error), el resto cae en el mensaje por defecto.
 */
export function mensajeDeError(err: unknown, fallback = "Ocurrió un error inesperado."): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}
