import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { addDays, TIME_ZONE, todayISO } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { CalendarEvent } from "@/types/planner";
import { getGoogleConfig } from "./config";
import { decrypt } from "./crypto";
import { GoogleAuthError, refreshAccessToken } from "./oauth";

const API = "https://www.googleapis.com/calendar/v3";

export type GoogleConnection = {
  googleEmail: string | null;
  refreshToken: string; // cifrado
  calendarIds: string[];
  status: "ok" | "error";
};

export type GoogleCalendar = { id: string; name: string; primary: boolean; selected: boolean };

/**
 * Mi conexión con Google (o null). Si la tabla aún no existe o falla la consulta,
 * devuelve null para que el planificador siga funcionando sin Google.
 */
export const getGoogleConnection = cache(async (): Promise<GoogleConnection | null> => {
  await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("google_connections")
    .select("google_email, refresh_token, calendar_ids, status")
    .maybeSingle();
  if (error) {
    console.error("Google Calendar: no se pudo leer la conexión:", error.message);
    return null;
  }
  if (!data) return null;
  return {
    googleEmail: data.google_email,
    refreshToken: data.refresh_token,
    calendarIds: data.calendar_ids ?? [],
    status: data.status,
  };
});

/**
 * Access token válido para esta petición (cache: se pide una sola vez aunque
 * varias partes de la página lo necesiten). null si no hay conexión o falla.
 * Si Google responde invalid_grant (permiso retirado o caducado) se marca la
 * conexión como "error" para pedir que se reconecte.
 */
export const getAccessToken = cache(async (): Promise<string | null> => {
  const config = getGoogleConfig();
  const connection = await getGoogleConnection();
  if (!config || !connection || connection.status !== "ok") return null;

  try {
    const tokens = await refreshAccessToken(config, decrypt(connection.refreshToken));
    return tokens.access_token;
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      const user = await getCurrentUser();
      const supabase = await createClient();
      await supabase.from("google_connections").update({ status: "error" }).eq("user_id", user.id);
    } else {
      console.error("Google Calendar: no se pudo renovar el token:", error);
    }
    return null;
  }
});

async function googleGet<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Google Calendar respondió ${res.status} en ${path.split("?")[0]}`);
  return res.json() as Promise<T>;
}

/** Calendarios de la cuenta (el propio, los suscritos, el de la universidad...). */
export async function listCalendars(token: string): Promise<GoogleCalendar[]> {
  type Item = { id: string; summary?: string; summaryOverride?: string; primary?: boolean; selected?: boolean };
  const json = await googleGet<{ items?: Item[] }>(token, "/users/me/calendarList?minAccessRole=reader&maxResults=250");
  return (json.items ?? [])
    .map((c) => ({ id: c.id, name: c.summaryOverride ?? c.summary ?? c.id, primary: !!c.primary, selected: !!c.selected }))
    .sort((a, b) => Number(b.primary) - Number(a.primary) || a.name.localeCompare(b.name, "es"));
}

type GoogleEventItem = {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

const timeFormat = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE });

/** Convierte un evento de Google en eventos de Personal Hub (uno por día si dura varios días). */
function toEvents(item: GoogleEventItem, calendarId: string, from: string, to: string): CalendarEvent[] {
  if (item.status === "cancelled" || !item.start) return [];
  const base = { title: item.summary?.trim() || "(Sin título)", location: item.location, kind: "google" as const };

  // Evento con hora: se muestra en su día de inicio (hora de Madrid)
  if (item.start.dateTime) {
    const start = new Date(item.start.dateTime);
    const date = todayISO(start);
    if (date < from || date > to) return [];
    const end = item.end?.dateTime ? new Date(item.end.dateTime) : undefined;
    return [{
      ...base,
      id: `g-${calendarId}-${item.id}`,
      date,
      startTime: timeFormat.format(start),
      endTime: end && todayISO(end) === date ? timeFormat.format(end) : undefined,
    }];
  }

  // Evento de día completo: end.date es exclusivo (el día siguiente al último)
  if (item.start.date) {
    const last = item.end?.date ? addDays(item.end.date, -1) : item.start.date;
    const events: CalendarEvent[] = [];
    for (let day = item.start.date > from ? item.start.date : from; day <= last && day <= to; day = addDays(day, 1)) {
      events.push({ ...base, id: `g-${calendarId}-${item.id}-${day}`, date: day });
    }
    return events;
  }
  return [];
}

async function fetchCalendarEvents(token: string, calendarId: string, from: string, to: string): Promise<CalendarEvent[]> {
  // Margen de un día por cada lado; luego se filtra por la fecha exacta en Madrid
  const params = new URLSearchParams({
    timeMin: `${addDays(from, -1)}T00:00:00Z`,
    timeMax: `${addDays(to, 2)}T00:00:00Z`,
    singleEvents: "true", // expande los eventos repetidos (p. ej. una clase semanal)
    orderBy: "startTime",
    maxResults: "250",
  });
  const events: CalendarEvent[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 4; page++) {
    if (pageToken) params.set("pageToken", pageToken);
    const json = await googleGet<{ items?: GoogleEventItem[]; nextPageToken?: string }>(
      token,
      `/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    );
    for (const item of json.items ?? []) events.push(...toEvents(item, calendarId, from, to));
    pageToken = json.nextPageToken;
    if (!pageToken) break;
  }
  return events;
}

/**
 * Eventos de Google entre dos fechas. Nunca lanza error: si Google falla,
 * el planificador se muestra igualmente con el resto de eventos.
 */
export async function getGoogleEvents(from: string, to: string): Promise<CalendarEvent[]> {
  const connection = await getGoogleConnection();
  if (!connection || connection.calendarIds.length === 0) return [];
  const token = await getAccessToken();
  if (!token) return [];

  const lists = await Promise.all(
    connection.calendarIds.map((id) =>
      fetchCalendarEvents(token, id, from, to).catch((error) => {
        console.error("Google Calendar: no se pudieron leer los eventos:", error);
        return [];
      }),
    ),
  );
  return lists.flat();
}
