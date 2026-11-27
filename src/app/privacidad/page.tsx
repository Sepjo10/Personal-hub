import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Política de privacidad" };

/**
 * Página pública (sin sesión). Google la pide para publicar la app OAuth.
 * Explica qué datos usa Personal Hub y cómo retirar el permiso.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-12 text-sm leading-relaxed text-foreground/85">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Política de privacidad</h1>
        <p className="text-muted-foreground">Personal Hub · Última actualización: noviembre de 2026</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-medium text-foreground">Qué es Personal Hub</h2>
        <p>
          Personal Hub es una aplicación privada de productividad de uso personal. No admite registros públicos:
          solo la usa su propietario.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium text-foreground">Datos de Google Calendar</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Se solicita únicamente el permiso de <strong>solo lectura</strong> de Google Calendar (calendar.readonly).</li>
          <li>Los eventos se leen en el momento de mostrarlos en el planificador y <strong>no se copian</strong> a ninguna base de datos.</li>
          <li>Solo se guarda un token de acceso, <strong>cifrado</strong> (AES-256-GCM), y la lista de calendarios elegidos.</li>
          <li>Los datos no se venden, no se comparten con terceros y no se usan para publicidad ni para entrenar modelos.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium text-foreground">Otros datos</h2>
        <p>
          Las tareas, notas, finanzas y demás contenido se guardan en Supabase con seguridad a nivel de fila (RLS):
          cada usuario solo puede acceder a sus propios datos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-medium text-foreground">Cómo retirar el permiso</h2>
        <p>
          Desde Configuración, el botón «Desconectar» revoca el permiso en Google y borra el token. También se puede
          retirar en myaccount.google.com/connections.
        </p>
      </section>

      <p>
        <Link href="/" className="text-primary hover:underline">Volver a Personal Hub</Link>
      </p>
    </main>
  );
}
