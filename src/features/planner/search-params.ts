import { isValidISODate } from "@/lib/dates";

/** Tipo de los parámetros de la URL que Next.js pasa a una página (?fecha=...). */
export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Lee ?fecha=AAAA-MM-DD de la URL. Si falta o no es válida, usa la fecha de hoy.
 * Guardar la fecha en la URL permite recargar la vista y usar "atrás" del navegador.
 */
export async function getBaseDate(searchParams: SearchParams, today: string): Promise<string> {
  const { fecha } = await searchParams;
  return isValidISODate(fecha) ? fecha : today;
}
