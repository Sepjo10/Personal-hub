import { getCurrentUser } from "@/lib/auth";
import { addDays, daysBetween, weekdayIndex } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { CalendarEvent } from "@/types/planner";
import {
  DATE_COLUMNS,
  SESSION_COLUMNS,
  SUBJECT_COLUMNS,
  toAcademicDate,
  toSession,
  toSubject,
} from "@/features/academic/university-data";

/**
 * Eventos del calendario entre dos fechas, combinando varias fuentes reales:
 *  - Clases del horario (se "expanden": una por cada día de la semana que toque,
 *    solo dentro del periodo de su asignatura).
 *  - Exámenes y entregas.
 *  - Actividades con fecha.
 *  - Entrevistas de las candidaturas.
 * En la Fase 6 se añadirán aquí los eventos de Google Calendar.
 * No se duplica nada en la base de datos: los eventos se calculan al leer.
 */
export async function getCalendarEvents(from: string, to: string): Promise<CalendarEvent[]> {
  await getCurrentUser();
  const supabase = await createClient();

  const [subjects, sessions, dates, activities, applications] = await Promise.all([
    supabase.from("subjects").select(SUBJECT_COLUMNS).eq("active", true),
    supabase.from("class_sessions").select(SESSION_COLUMNS),
    supabase.from("academic_dates").select(DATE_COLUMNS).gte("date", from).lte("date", to).eq("done", false),
    supabase.from("activities").select("id, title, date, time, location").gte("date", from).lte("date", to),
    // Solo las que tienen alguna entrevista; el filtro por fechas se hace abajo
    supabase.from("job_applications").select("id, company, interviews").neq("interviews", "{}"),
  ]);

  const error = subjects.error ?? sessions.error ?? dates.error ?? activities.error ?? applications.error;
  if (error) throw new Error(`No se pudieron cargar los eventos: ${error.message}`);

  const subjectById = new Map((subjects.data ?? []).map((r) => [r.id as string, toSubject(r as never)] as const));
  const events: CalendarEvent[] = [];

  // Clases: recorre cada día del rango y añade las sesiones de ese día de la semana
  const sessionList = (sessions.data ?? []).map((r) => toSession(r as never));
  for (let i = 0; i <= daysBetween(from, to); i++) {
    const day = addDays(from, i);
    for (const s of sessionList) {
      const subject = subjectById.get(s.subjectId);
      if (!subject || s.weekday !== weekdayIndex(day)) continue;
      if (subject.periodStart && day < subject.periodStart) continue;
      if (subject.periodEnd && day > subject.periodEnd) continue;
      events.push({
        id: `${s.id}-${day}`,
        title: subject.name,
        date: day,
        startTime: s.start,
        endTime: s.end,
        location: s.room,
        kind: "class",
      });
    }
  }

  for (const r of dates.data ?? []) {
    const d = toAcademicDate(r as never);
    const subject = d.subjectId ? subjectById.get(d.subjectId) : undefined;
    events.push({
      id: d.id,
      title: subject ? `${d.title} · ${subject.code ?? subject.name}` : d.title,
      date: d.date,
      startTime: d.time,
      kind: d.kind,
    });
  }

  for (const a of activities.data ?? []) {
    events.push({
      id: a.id as string,
      title: a.title as string,
      date: a.date as string,
      startTime: (a.time as string | null)?.slice(0, 5) ?? undefined,
      location: (a.location as string | null) ?? undefined,
      kind: "personal",
    });
  }

  for (const app of applications.data ?? []) {
    for (const day of app.interviews as string[]) {
      if (day < from || day > to) continue;
      events.push({ id: `${app.id}-${day}`, title: `Entrevista · ${app.company}`, date: day, kind: "personal" });
    }
  }

  return events;
}
