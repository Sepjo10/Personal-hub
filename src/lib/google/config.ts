/**
 * Configuración de Google leída de .env.local (solo en el servidor: ninguna
 * variable lleva NEXT_PUBLIC_, así que nunca llegan al navegador).
 * Devuelve null si falta alguna, y la app sigue funcionando sin Google.
 */
export type GoogleConfig = { clientId: string; clientSecret: string; redirectUri: string };

export function getGoogleConfig(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri || !process.env.GOOGLE_TOKEN_KEY) return null;
  return { clientId, clientSecret, redirectUri };
}
