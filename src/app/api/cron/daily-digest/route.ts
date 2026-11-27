import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { formatLongDate, todayISO } from "@/lib/dates";
import { sendPush, type PushPayload } from "@/lib/push";

/**
 * GET /api/cron/daily-digest. Lo llama el cron de Vercel cada mañana (vercel.json).
 * Seguridad:
 * - Vercel envía "Authorization: Bearer CRON_SECRET"; cualquier otra petición recibe 401.
 * - No hay sesión de usuario, pero tampoco usamos la service_role key: la función
 *   daily_digest() de Postgres vuelve a comprobar el secreto antes de devolver nada.
 */

type DigestRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
  tasks_pending: number;
  task_titles: string[];
  classes: number;
  academic: string[];
  activities: string[];
};

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Texto de la notificación, p. ej. "3 tareas pendientes · 2 clases" + lista. */
function buildDigest(row: DigestRow, today: string): PushPayload {
  const summary = [
    row.tasks_pending > 0 ? plural(row.tasks_pending, "tarea pendiente", "tareas pendientes") : "Sin tareas pendientes",
    row.classes > 0 ? plural(row.classes, "clase", "clases") : null,
  ].filter(Boolean).join(" · ");

  const lines = [
    ...row.academic,
    ...row.task_titles.map((t) => `• ${t}`),
    row.tasks_pending > row.task_titles.length ? `  y ${row.tasks_pending - row.task_titles.length} más` : null,
    ...row.activities.map((a) => `Actividad: ${a}`),
  ].filter(Boolean);

  const date = formatLongDate(today);
  return {
    title: `Tu día · ${date.charAt(0).toUpperCase()}${date.slice(1)}`,
    body: [summary, ...lines].join("\n"),
    url: "/planificador/hoy",
    tag: `digest-${today}`, // si llegara dos veces, la segunda sustituye a la primera
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const secret = process.env.CRON_SECRET!;
  const today = todayISO();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("daily_digest", { p_secret: secret, p_date: today });
  if (error) {
    console.error("Resumen diario: error al leer los datos:", error.message);
    return NextResponse.json({ error: "No se pudo generar el resumen" }, { status: 500 });
  }

  let sent = 0;
  let removed = 0;
  for (const row of (data ?? []) as DigestRow[]) {
    const result = await sendPush({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, buildDigest(row, today));
    if (result === "ok") sent++;
    if (result === "gone") {
      await supabase.rpc("remove_push_subscription", { p_secret: secret, p_endpoint: row.endpoint });
      removed++;
    }
  }

  return NextResponse.json({ date: today, sent, removed });
}
