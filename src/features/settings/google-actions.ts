"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getAccessToken, getGoogleConnection, listCalendars } from "@/lib/google/calendar";
import { decrypt } from "@/lib/google/crypto";
import { revokeToken } from "@/lib/google/oauth";
import { createClient } from "@/lib/supabase/server";

export type GoogleActionResult = { ok: boolean; error?: string };

/** Desconecta: retira el permiso en Google y borra el token de la base de datos. */
export async function disconnectGoogle(): Promise<GoogleActionResult> {
  const user = await getCurrentUser();
  const connection = await getGoogleConnection();
  if (connection) {
    try {
      await revokeToken(decrypt(connection.refreshToken));
    } catch {
      // Si no se puede descifrar o Google no responde, igualmente borramos la fila
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("google_connections").delete().eq("user_id", user.id);
  if (error) return { ok: false, error: "No se pudo desconectar Google Calendar." };

  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Guarda qué calendarios se muestran. Solo se aceptan ids que existen de verdad
 * en tu cuenta de Google (nunca nos fiamos de lo que manda el navegador).
 */
export async function saveGoogleCalendars(_prev: GoogleActionResult | null, formData: FormData): Promise<GoogleActionResult> {
  const user = await getCurrentUser();
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "La conexión con Google no está activa. Vuelve a conectar." };

  let available: Set<string>;
  try {
    available = new Set((await listCalendars(token)).map((c) => c.id));
  } catch {
    return { ok: false, error: "No se pudo contactar con Google. Inténtalo de nuevo." };
  }
  const ids = [...new Set(formData.getAll("calendars").map(String))].filter((id) => available.has(id));

  const supabase = await createClient();
  const { error } = await supabase.from("google_connections").update({ calendar_ids: ids }).eq("user_id", user.id);
  if (error) return { ok: false, error: "No se pudieron guardar los calendarios." };

  revalidatePath("/", "layout");
  return { ok: true };
}
