"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isValidISODate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export type ActivityActionResult = { ok: boolean; error?: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;
const TYPES = ["flight", "trip", "cinema", "concert", "medical", "event"];

/** "Ana, Luis\nMarta" -> ["Ana", "Luis", "Marta"] */
const splitList = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

function parseActivity(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "event");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = priceRaw ? Number(priceRaw.replace(",", ".")) : null;
  const links = String(formData.get("links") ?? "").split(/\s+/).map((s) => s.trim()).filter(Boolean);
  const people = splitList(formData.get("people"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title) return { ok: false as const, error: "El título es obligatorio." };
  if (title.length > 150 || location.length > 200) return { ok: false as const, error: "Algún campo es demasiado largo." };
  if (!TYPES.includes(type)) return { ok: false as const, error: "Tipo no válido." };
  if (date && !isValidISODate(date)) return { ok: false as const, error: "Fecha no válida." };
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return { ok: false as const, error: "Hora no válida (HH:MM)." };
  if (price !== null && (!Number.isFinite(price) || price < 0 || price >= 10_000_000)) return { ok: false as const, error: "Precio no válido." };
  if (links.some((l) => !/^https?:\/\//i.test(l))) return { ok: false as const, error: "Cada enlace debe empezar por http:// o https://" };
  if (links.length > 10 || people.length > 30) return { ok: false as const, error: "Demasiados enlaces o personas." };
  if (notes.length > 5000) return { ok: false as const, error: "Las notas son demasiado largas." };

  return {
    ok: true as const,
    values: {
      title,
      type,
      date: date || null,
      time: time || null,
      location: location || null,
      price: price === null ? null : Math.round(price * 100) / 100,
      links,
      people,
      notes: notes || null,
    },
  };
}

export async function saveActivity(id: string | null, formData: FormData): Promise<ActivityActionResult> {
  await getCurrentUser();
  if (id && !UUID_RE.test(id)) return { ok: false, error: "Actividad no válida." };
  const parsed = parseActivity(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("activities").update(parsed.values).eq("id", id)
    : await supabase.from("activities").insert(parsed.values);
  if (error) return { ok: false, error: "No se pudo guardar la actividad." };

  revalidatePath("/ocio/actividades");
  return { ok: true };
}

export async function deleteActivity(id: string): Promise<ActivityActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Actividad no válida." };

  const supabase = await createClient();
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar la actividad." };

  revalidatePath("/ocio/actividades");
  return { ok: true };
}
