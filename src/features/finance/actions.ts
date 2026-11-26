"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isValidISODate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export type FinanceActionResult = { ok: boolean; error?: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

function parseTransaction(formData: FormData) {
  const type = String(formData.get("type") ?? "");
  const concept = String(formData.get("concept") ?? "").trim();
  // Aceptamos coma decimal española: "12,50" -> 12.5
  const amount = Number(String(formData.get("amount") ?? "").replace(",", "."));
  const category = String(formData.get("category") ?? "").trim() || "Otros";
  const date = String(formData.get("date") ?? "");

  if (type !== "income" && type !== "expense") return { ok: false as const, error: "Tipo no válido." };
  if (!concept) return { ok: false as const, error: "El concepto es obligatorio." };
  if (concept.length > 120) return { ok: false as const, error: "El concepto es demasiado largo." };
  if (!Number.isFinite(amount) || amount <= 0 || amount >= 10_000_000) return { ok: false as const, error: "Introduce un importe válido mayor que 0." };
  if (category.length > 50) return { ok: false as const, error: "La categoría es demasiado larga." };
  if (!isValidISODate(date)) return { ok: false as const, error: "Indica una fecha válida." };

  return { ok: true as const, values: { type, concept, amount: Math.round(amount * 100) / 100, category, date } };
}

export async function saveTransaction(id: string | null, formData: FormData): Promise<FinanceActionResult> {
  await getCurrentUser();
  if (id && !UUID_RE.test(id)) return { ok: false, error: "Movimiento no válido." };
  const parsed = parseTransaction(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("transactions").update(parsed.values).eq("id", id)
    : await supabase.from("transactions").insert(parsed.values);
  if (error) return { ok: false, error: "No se pudo guardar el movimiento." };

  revalidatePath("/finanzas");
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<FinanceActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Movimiento no válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar el movimiento." };

  revalidatePath("/finanzas");
  return { ok: true };
}
