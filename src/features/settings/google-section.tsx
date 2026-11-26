import { CalendarDays } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getAccessToken, getGoogleConnection, listCalendars, type GoogleCalendar } from "@/lib/google/calendar";
import { getGoogleConfig } from "@/lib/google/config";
import type { SearchParams } from "@/features/planner/search-params";
import { DisconnectGoogleButton, GoogleCalendarsForm } from "./google-controls";

/** Mensajes según el resultado que devuelve /api/google/callback en ?google=... */
const NOTICES: Record<string, { text: string; ok: boolean }> = {
  conectado: { text: "Google Calendar conectado correctamente.", ok: true },
  cancelado: { text: "Has cancelado la conexión con Google.", ok: false },
  permiso: { text: "Para conectar tienes que marcar el permiso de ver tus calendarios.", ok: false },
  config: { text: "Faltan las variables GOOGLE_* en .env.local.", ok: false },
  error: { text: "No se pudo conectar con Google. Inténtalo de nuevo.", ok: false },
};

/** Sección de Google Calendar en Configuración (servidor; va dentro de Suspense). */
export async function GoogleSection({ searchParams }: { searchParams: SearchParams }) {
  const { google } = await searchParams;
  const notice = typeof google === "string" ? NOTICES[google] : undefined;
  const connectLink = (label: string) => (
    <a href="/api/google/connect" className={buttonVariants({ variant: "outline" })}>{label}</a>
  );

  let description: React.ReactNode;
  let action: React.ReactNode = null;
  let calendars: GoogleCalendar[] | null = null;
  let selected: string[] = [];

  const connection = getGoogleConfig() ? await getGoogleConnection() : null;
  if (!getGoogleConfig()) {
    description = "Falta configurar las variables GOOGLE_* en .env.local.";
  } else if (!connection) {
    description = "Muestra tus eventos de Google en el planificador (solo lectura).";
    action = connectLink("Conectar");
  } else if (connection.status === "error") {
    description = "Google ha retirado o caducado el permiso. Vuelve a conectar para seguir viendo tus eventos.";
    action = connectLink("Reconectar");
  } else {
    const token = await getAccessToken();
    calendars = token ? await listCalendars(token).catch(() => null) : null;
    selected = connection.calendarIds;
    description = calendars
      ? `Conectado como ${connection.googleEmail ?? "tu cuenta de Google"}.`
      : "Conectado, pero ahora mismo no se puede contactar con Google. Si sigue pasando, desconecta y vuelve a conectar.";
    action = <DisconnectGoogleButton />;
  }

  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <CalendarDays className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Google Calendar</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      {notice && (
        <p role="status" className={notice.ok ? "mt-3 text-sm text-emerald-300" : "mt-3 text-sm text-destructive"}>{notice.text}</p>
      )}
      {calendars && calendars.length > 0 && <GoogleCalendarsForm calendars={calendars} selected={selected} />}
    </section>
  );
}
