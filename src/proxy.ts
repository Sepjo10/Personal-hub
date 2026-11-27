import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Proxy de Next.js 16 (antes llamado "middleware"): se ejecuta antes de cada petición.
 * Aquí lo usamos para mantener la sesión y proteger las rutas privadas.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Todas las rutas excepto archivos estáticos, imágenes y los archivos de la PWA
  // (el manifest, el service worker y la página sin conexión deben cargarse sin sesión)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
