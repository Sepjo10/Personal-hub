import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getGoogleConfig } from "@/lib/google/config";
import { buildAuthUrl } from "@/lib/google/oauth";

const STATE_COOKIE = "google_oauth_state";

/**
 * GET /api/google/connect: empieza la conexión.
 * Genera un "state" aleatorio, lo guarda en una cookie httpOnly y manda a Google.
 */
export async function GET(request: Request) {
  await getCurrentUser();
  const config = getGoogleConfig();
  if (!config) return NextResponse.redirect(new URL("/configuracion?google=config", request.url));

  const state = randomBytes(16).toString("hex");
  (await cookies()).set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // se envía al volver de Google (navegación normal)
    path: "/api/google",
    maxAge: 600, // 10 minutos para completar el proceso
  });

  return NextResponse.redirect(buildAuthUrl(config, state));
}
