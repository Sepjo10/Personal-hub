import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Páginas accesibles sin sesión. /privacidad es pública porque Google la exige para publicar la app OAuth.
const PUBLIC_PATHS = ["/login", "/privacidad"];
// Páginas de las que se redirige a / si ya hay sesión.
const AUTH_PATHS = ["/login"];

/**
 * Se ejecuta antes de cada petición (desde src/proxy.ts):
 * 1. Renueva la sesión de Supabase si el token ha caducado y guarda las cookies nuevas.
 * 2. Redirige a /login si no hay sesión, y a / si ya la hay y se visita /login.
 * Es una comprobación "optimista" para la navegación: la seguridad real de los
 * datos la dan RLS y la verificación en cada consulta (src/lib/auth.ts).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // getUser() valida el token con Supabase (no se fía solo de la cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) return redirectTo(request, "/login");
  if (user && AUTH_PATHS.some((p) => pathname.startsWith(p))) return redirectTo(request, "/");

  return response;
}

function redirectTo(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}
