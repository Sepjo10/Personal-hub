"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isValidISODate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export type AcademicActionResult = { ok: boolean; error?: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const fail = (error: string) => ({ ok: false as const, error });

/** Las vistas de Universidad y del planificador (clases y exámenes) dependen de estos datos. */
function refresh() {
  revalidatePath("/", "layout");
}

async function write(table: string, id: string | null, values: Record<string, unknown>, label: string): Promise<AcademicActionResult> {
  await getCurrentUser();
  if (id && !UUID_RE.test(id)) return fail(`${label} no válida.`);
  const supabase = await createClient();
  const { error } = id ? await supabase.from(table).update(values).eq("id", id) : await supabase.from(table).insert(values);
  if (error) return fail(`No se pudo guardar: ${label.toLowerCase()}.`);
  refresh();
  return { ok: true };
}

async function remove(table: string, id: string): Promise<AcademicActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return fail("Elemento no válido.");
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return fail("No se pudo eliminar.");
  refresh();
  return { ok: true };
}

// ---------- Asignaturas ----------
export async function saveSubject(id: string | null, fd: FormData): Promise<AcademicActionResult> {
  const name = str(fd, "name");
  const code = str(fd, "code");
  const professor = str(fd, "professor");
  const progress = Number(str(fd, "progress") || 0);
  const periodStart = str(fd, "periodStart");
  const periodEnd = str(fd, "periodEnd");
  const active = fd.get("active") === "on";

  if (!name) return fail("El nombre es obligatorio.");
  if (name.length > 100 || code.length > 20 || professor.length > 100) return fail("Algún campo es demasiado largo.");
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) return fail("El progreso debe estar entre 0 y 100.");
  if ((periodStart && !isValidISODate(periodStart)) || (periodEnd && !isValidISODate(periodEnd))) return fail("Fechas del periodo no válidas.");
  if (periodStart && periodEnd && periodEnd < periodStart) return fail("El fin del periodo no puede ser anterior al inicio.");

  return write("subjects", id, {
    name,
    code: code || null,
    professor: professor || null,
    progress,
    period_start: periodStart || null,
    period_end: periodEnd || null,
    active,
  }, "Asignatura");
}

export async function deleteSubject(id: string) {
  return remove("subjects", id);
}

// ---------- Clases (horario) ----------
export async function saveSession(id: string | null, fd: FormData): Promise<AcademicActionResult> {
  const subjectId = str(fd, "subjectId");
  const weekday = Number(str(fd, "weekday"));
  const start = str(fd, "start");
  const end = str(fd, "end");
  const room = str(fd, "room");

  if (!UUID_RE.test(subjectId)) return fail("Elige una asignatura.");
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return fail("Día no válido.");
  if (!TIME_RE.test(start) || !TIME_RE.test(end)) return fail("Indica las horas en formato HH:MM.");
  if (end <= start) return fail("La hora de fin debe ser posterior a la de inicio.");
  if (room.length > 50) return fail("El aula es demasiado larga.");

  return write("class_sessions", id, { subject_id: subjectId, weekday, start_time: start, end_time: end, room: room || null }, "Clase");
}

export async function deleteSession(id: string) {
  return remove("class_sessions", id);
}

// ---------- Exámenes y entregas ----------
export async function saveAcademicDate(id: string | null, fd: FormData): Promise<AcademicActionResult> {
  const subjectId = str(fd, "subjectId");
  const title = str(fd, "title");
  const kind = str(fd, "kind");
  const date = str(fd, "date");
  const time = str(fd, "time");

  if (subjectId && !UUID_RE.test(subjectId)) return fail("Asignatura no válida.");
  if (!title) return fail("El título es obligatorio.");
  if (title.length > 150) return fail("El título es demasiado largo.");
  if (kind !== "exam" && kind !== "deadline") return fail("Tipo no válido.");
  if (!isValidISODate(date)) return fail("Indica una fecha válida.");
  if (time && !TIME_RE.test(time)) return fail("Hora no válida (HH:MM).");

  return write("academic_dates", id, { subject_id: subjectId || null, title, kind, date, time: time || null }, "Fecha");
}

export async function setAcademicDateDone(id: string, done: boolean): Promise<AcademicActionResult> {
  return write("academic_dates", id, { done }, "Fecha");
}

export async function deleteAcademicDate(id: string) {
  return remove("academic_dates", id);
}
