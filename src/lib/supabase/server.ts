import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para el SERVIDOR (Server Components y Server Actions).
 * La sesión del usuario viaja en cookies; este cliente las lee (y las renueva)
 * para que cada consulta se haga en nombre del usuario conectado y RLS se aplique.
 * Se crea uno nuevo en cada petición: nunca se comparte entre usuarios.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Los Server Components no pueden escribir cookies. No pasa nada:
            // el proxy (src/proxy.ts) ya se encarga de renovar la sesión.
          }
        },
      },
    },
  );
}
