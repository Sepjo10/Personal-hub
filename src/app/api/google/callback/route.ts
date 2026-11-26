import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listCalendars } from "@/lib/google/calendar";
import { getGoogleConfig } from "@/lib/google/config";
import { encrypt } from "@/lib/google/crypto";
import { exchangeCode, hasCalendarScope } from "@/lib/google/oauth";
import { createClient } from "@/lib/supabase/server";

const STATE_COOKIE = "google_oauth_state";

/**
 * GET /api/google/callback: Google vuelve aquí tras pedir permiso.
 * 1. Comprueba que el state coincide con la cookie (evita CSRF).
 * 2. Cambia el código por los tokens.
 * 3. Guarda el refresh token cifrado y los calendarios visibles por defecto.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  const url = new URL(request.url);
  const back = (result: string) => NextResponse.redirect(new URL(`/configuracion?google=${result}`, request.url));

  const cookieStore = await cookies();
  const expected = cookieStore.get(STATE_COOKIE)?.value ?? "";
  cookieStore.delete({ name: STATE_COOKIE, path: "/api/google" });

  const state = url.searchParams.get("state") ?? "";
  const valid = expected.length > 0 && state.length === expected.length && timingSafeEqual(Buffer.from(state), Buffer.from(expected));
  if (!valid) return back("error");

  if (url.searchParams.get("error")) return back("cancelado");
  const code = url.searchParams.get("code");
  const config = getGoogleConfig();
  if (!code || !config) return back("error");

  try {
    const tokens = await exchangeCode(config, code);
    if (!hasCalendarScope(tokens.scope)) return back("permiso");
    if (!tokens.refresh_token) return back("error");

    // Por defecto, los calendarios que ya tienes visibles en Google Calendar
    const calendars = await listCalendars(tokens.access_token);
    const primary = calendars.find((c) => c.primary);

    const supabase = await createClient();
    const { error } = await supabase.from("google_connections").upsert({
      user_id: user.id,
      google_email: primary?.id ?? null,
      refresh_token: encrypt(tokens.refresh_token),
      calendar_ids: calendars.filter((c) => c.selected).map((c) => c.id),
      status: "ok",
      connected_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Google Calendar: no se pudo guardar la conexión:", error.message);
      return back("error");
    }
  } catch (error) {
    console.error("Google Calendar: fallo al conectar:", error);
    return back("error");
  }

  return back("conectado");
}
