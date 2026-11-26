import type { GoogleConfig } from "./config";

/** Solo lectura: Personal Hub nunca puede crear, editar ni borrar eventos. */
export const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

/** Google ha retirado o caducado el permiso: hay que volver a conectar. */
export class GoogleAuthError extends Error {}

type TokenResponse = { access_token: string; refresh_token?: string; scope?: string; expires_in: number };

/**
 * URL de la pantalla de permisos de Google.
 * access_type=offline + prompt=consent -> Google devuelve siempre un refresh token.
 * state es un valor aleatorio que comprobamos a la vuelta (protección CSRF).
 */
export function buildAuthUrl(config: GoogleConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: CALENDAR_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (json.error === "invalid_grant") throw new GoogleAuthError("Permiso de Google revocado o caducado.");
    throw new Error(`Error de Google al pedir el token (${res.status}).`);
  }
  return json as TokenResponse;
}

/** Cambia el código de un solo uso que manda Google por los tokens. */
export function exchangeCode(config: GoogleConfig, code: string) {
  return tokenRequest({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  });
}

/** Pide un access token nuevo (dura ~1 hora) usando el refresh token. */
export function refreshAccessToken(config: GoogleConfig, refreshToken: string) {
  return tokenRequest({
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
  });
}

/** Retira el permiso en Google al desconectar. Si falla no pasa nada: igualmente borramos el token. */
export async function revokeToken(token: string) {
  await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }),
  }).catch(() => undefined);
}

/** Google permite desmarcar permisos en su pantalla: comprobamos que nos dio el de Calendar. */
export const hasCalendarScope = (scope?: string) => (scope ?? "").split(" ").includes(CALENDAR_SCOPE);
