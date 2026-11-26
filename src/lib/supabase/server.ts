import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * Cliente de Supabase para el SERVIDOR (Server Components y Server Actions).
 * La sesión del usuario viaja en cookies; este cliente las lee (y las renueva)
 * para que cada consulta se haga en nombre del usuario conectado y RLS se aplique.
 * Se crea uno nuevo en cada petición: nunca se comparte entre usuarios.
 *
 * connection() marca explícitamente cualquier acceso a la base de datos como
 * "contenido de cada petición". Sin esto, Next.js (Cache Components) puede
 * intentar pre-renderizar parte del trabajo de Supabase, que internamente usa
 * la hora actual (Date.now) para comprobar si la sesión ha caducado.
 */
export async function createClient() {
  await connection();
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
