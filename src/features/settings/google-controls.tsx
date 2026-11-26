"use client";

import { useActionState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { GoogleCalendar } from "@/lib/google/calendar";
import { disconnectGoogle, saveGoogleCalendars, type GoogleActionResult } from "./google-actions";

/** Lista de calendarios con casillas para elegir cuáles se muestran en el planificador. */
export function GoogleCalendarsForm({ calendars, selected }: { calendars: GoogleCalendar[]; selected: string[] }) {
  const [result, formAction, pending] = useActionState<GoogleActionResult | null, FormData>(saveGoogleCalendars, null);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <p className="text-sm text-muted-foreground">Calendarios que se muestran en el planificador:</p>
      <ul className="space-y-2">
        {calendars.map((c) => (
          <li key={c.id}>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" name="calendars" value={c.id} defaultChecked={selected.includes(c.id)} className="size-4 accent-primary" />
              <span className="truncate">{c.name}</span>
              {c.primary && <span className="text-xs text-muted-foreground">(principal)</span>}
            </label>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>{pending ? "Guardando…" : "Guardar calendarios"}</Button>
        {result?.ok && <span className="text-sm text-emerald-300">Guardado.</span>}
        {result && !result.ok && <span role="alert" className="text-sm text-destructive">{result.error}</span>}
      </div>
    </form>
  );
}

export function DisconnectGoogleButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => void (await disconnectGoogle()))}>
      {pending ? "Desconectando…" : "Desconectar"}
    </Button>
  );
}
