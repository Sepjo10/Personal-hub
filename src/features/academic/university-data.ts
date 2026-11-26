import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AcademicDate, ClassSession, Subject } from "@/types/academic";

type SubjectRow = {
  id: string;
  name: string;
  code: string | null;
  professor: string | null;
  progress: number;
  period_start: string | null;
  period_end: string | null;
  active: boolean;
};
type SessionRow = { id: string; subject_id: string; weekday: number; start_time: string; end_time: string; room: string | null };
type DateRow = { id: string; subject_id: string | null; title: string; kind: "exam" | "deadline"; date: string; time: string | null; done: boolean };

export const toSubject = (r: SubjectRow): Subject => ({
  id: r.id,
  name: r.name,
  code: r.code ?? undefined,
  professor: r.professor ?? undefined,
  progress: r.progress,
  periodStart: r.period_start ?? undefined,
  periodEnd: r.period_end ?? undefined,
  active: r.active,
});

export const toSession = (r: SessionRow): ClassSession => ({
  id: r.id,
  subjectId: r.subject_id,
  weekday: r.weekday,
  start: r.start_time.slice(0, 5),
  end: r.end_time.slice(0, 5),
  room: r.room ?? undefined,
});

export const toAcademicDate = (r: DateRow): AcademicDate => ({
  id: r.id,
  subjectId: r.subject_id ?? undefined,
  title: r.title,
  kind: r.kind,
  date: r.date,
  time: r.time?.slice(0, 5) ?? undefined,
  done: r.done,
});

export const SUBJECT_COLUMNS = "id, name, code, professor, progress, period_start, period_end, active";
export const SESSION_COLUMNS = "id, subject_id, weekday, start_time, end_time, room";
export const DATE_COLUMNS = "id, subject_id, title, kind, date, time, done";

/** Asignaturas, horario y fechas académicas (las tres consultas en paralelo). */
export async function getUniversityData() {
  await getCurrentUser();
  const supabase = await createClient();

  const [subjects, sessions, dates] = await Promise.all([
    supabase.from("subjects").select(SUBJECT_COLUMNS).order("active", { ascending: false }).order("name"),
    supabase.from("class_sessions").select(SESSION_COLUMNS).order("weekday").order("start_time"),
    supabase.from("academic_dates").select(DATE_COLUMNS).order("date").order("time", { nullsFirst: false }),
  ]);

  const error = subjects.error ?? sessions.error ?? dates.error;
  if (error) throw new Error(`No se pudieron cargar los datos académicos: ${error.message}`);

  return {
    subjects: (subjects.data as SubjectRow[]).map(toSubject),
    sessions: (sessions.data as SessionRow[]).map(toSession),
    dates: (dates.data as DateRow[]).map(toAcademicDate),
  };
}
