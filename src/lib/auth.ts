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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return { id: user.id, email: user.email ?? "" };
});
