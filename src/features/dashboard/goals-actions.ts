"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

/** Mismo patrón de siempre: sesión -> validación -> Supabase -> revalidar. */

export type GoalActionResult = { ok: boolean; error?: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;
const MAX = 999999;

/** Convierte "1,5" o "1.5" en número; NaN si no es válido. */
function toNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim().replace(",", ".");
  return text === "" ? NaN : Number(text);
}

function parseGoal(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const target = toNumber(formData.get("target"));
  const step = toNumber(formData.get("step") || "1");

  if (!label) return { ok: false as const, error: "El nombre es obligatorio." };
  if (label.length > 40) return { ok: false as const, error: "El nombre no puede superar 40 caracteres." };
  if (unit.length > 15) return { ok: false as const, error: "La unidad no puede superar 15 caracteres." };
  if (!(target > 0 && target <= MAX)) return { ok: false as const, error: "La meta debe ser un número mayor que 0." };
  if (!(step > 0 && step <= target)) return { ok: false as const, error: "El incremento debe ser mayor que 0 y no superar la meta." };

  return { ok: true as const, values: { label, unit, target: round2(target), step: round2(step) } };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function saveGoal(id: string | null, formData: FormData): Promise<GoalActionResult> {
  await getCurrentUser();
  if (id && !UUID_RE.test(id)) return { ok: false, error: "Objetivo no válido." };
  const parsed = parseGoal(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("daily_goals").update(parsed.values).eq("id", id)
    : await supabase.from("daily_goals").insert(parsed.values);
  if (error) return { ok: false, error: "No se pudo guardar el objetivo." };

  revalidatePath("/");
  return { ok: true };
}

export async function deleteGoal(id: string): Promise<GoalActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Objetivo no válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("daily_goals").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar el objetivo." };

  revalidatePath("/");
  return { ok: true };
}

/**
 * Guarda lo que llevas HOY en un objetivo. La fecha la decide el servidor
 * (zona Europe/Madrid), no el navegador, para que no se pueda falsear.
 * upsert: crea la fila del día si no existe o la actualiza si ya existe.
 */
export async function setGoalProgress(goalId: string, value: number): Promise<GoalActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(goalId)) return { ok: false, error: "Objetivo no válido." };
  if (!Number.isFinite(value) || value < 0 || value > MAX) return { ok: false, error: "Valor no válido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("goal_logs")
    .upsert({ goal_id: goalId, log_date: todayISO(new Date()), value: round2(value) }, { onConflict: "goal_id,log_date" });
  if (error) return { ok: false, error: "No se pudo guardar el progreso." };

  revalidatePath("/");
  return { ok: true };
}
