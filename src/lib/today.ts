import { connection } from "next/server";
import { todayISO } from "./dates";

/**
 * Devuelve la fecha de hoy (AAAA-MM-DD) en el momento de la petición.
 * connection() le dice a Next.js que no genere este contenido por adelantado;
 * quien lo use debe ir dentro de <Suspense>.
 */
export async function getToday(): Promise<string> {
  await connection();
  return todayISO();
}
