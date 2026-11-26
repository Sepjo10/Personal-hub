/**
 * Utilidades de fechas. Usamos siempre la zona horaria de Madrid para que
 * "hoy" sea el mismo día aunque el servidor (p. ej. Vercel) esté en UTC.
 */
export const TIME_ZONE = "Europe/Madrid";

/** Fecha de hoy en formato "AAAA-MM-DD". */
export function todayISO(now: Date = new Date()): string {
  // El formato en-CA produce justo "AAAA-MM-DD"
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/** Suma (o resta) días a una fecha ISO. */
export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`); // mediodía UTC: evita saltos por cambio de hora
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Días de diferencia entre dos fechas ISO (to - from). */
export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** "jueves, 26 de noviembre" */
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

/** "Hoy", "Mañana" o "vie 28" */
export function relativeDayLabel(iso: string, today: string): string {
  const diff = daysBetween(today, iso);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  return new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T12:00:00Z`),
  );
}

/** Saludo según la hora actual en Madrid. */
export function greeting(now: Date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("es-ES", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(now),
  );
  if (hour < 14) return "Buenos días";
  if (hour < 21) return "Buenas tardes";
  return "Buenas noches";
}

/** Día de la semana empezando en lunes: 0 = lunes ... 6 = domingo. */
export function weekdayIndex(iso: string): number {
  return (new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7;
}

/** Lunes de la semana de una fecha. */
export function startOfWeek(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

/** Las 42 casillas (6 semanas) del calendario mensual que contiene la fecha. */
export function monthGridDays(iso: string): string[] {
  const start = startOfWeek(`${iso.slice(0, 8)}01`);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** Formato libre en español, p. ej. formatDate(iso, { day: "numeric", month: "short" }) -> "26 nov". */
export function formatDate(iso: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("es-ES", { ...options, timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

export const WEEKDAYS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

/** Primer día del mes desplazado n meses: addMonths("2026-11-26", 1) -> "2026-12-01". */
export function addMonths(iso: string, months: number): string {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + months, 1)).toISOString().slice(0, 10);
}

/** Comprueba que un texto es una fecha real "AAAA-MM-DD" (sirve para validar la URL). */
export function isValidISODate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
