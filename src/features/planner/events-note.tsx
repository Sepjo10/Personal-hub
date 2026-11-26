import Link from "next/link";
import { getGoogleConnection } from "@/lib/google/calendar";

/** Aviso: qué incluyen los eventos y el estado de Google Calendar. */
export async function EventsNote() {
  const google = await getGoogleConnection();
  return (
    <p className="mt-3 text-xs text-muted-foreground/70">
      Eventos: clases, exámenes, entregas, actividades y entrevistas
      {google?.status === "ok" && " · Google Calendar conectado"}
      {google?.status === "error" && (
        <>
          {" · "}
          <Link href="/configuracion" className="text-destructive hover:underline">Google Calendar necesita reconectarse</Link>
        </>
      )}
      {!google && (
        <>
          {" · "}
          <Link href="/configuracion" className="hover:underline">Conectar Google Calendar</Link>
        </>
      )}
    </p>
  );
}
