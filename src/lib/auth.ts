import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string };

/**
 * Capa de acceso a datos (DAL) para la autenticación.
 * Toda lectura o escritura de datos privados debe empezar llamando a esta función:
 * verifica la sesión en el servidor y, si no hay usuario, manda al login.
 * cache() evita repetir la comprobación varias veces en la misma petición.
 * Devuelve solo lo necesario (id y email), no la sesión completa.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const supabase = await createClient();
  // getClaims() verifica la firma del JWT localmente (claves públicas de Supabase, en caché).
  // Si el proyecto usara claves antiguas, internamente consulta a Supabase como getUser().
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) redirect("/login");
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
});
