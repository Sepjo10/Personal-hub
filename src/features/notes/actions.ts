"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Mismo patrón que las tareas: sesión -> validación -> Supabase -> revalidar. */

export type NoteActionResult = { ok: boolean; error?: string };

const KINDS = ["quick", "important", "resource", "link"];
const UUID_RE = /^[0-9a-f-]{36}$/i;

function parseNote(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const kind = String(formData.get("kind") ?? "quick");
  const url = String(formData.get("url") ?? "").trim();

  if (!title) return { ok: false as const, error: "El título es obligatorio." };
  if (title.length > 120) return { ok: false as const, error: "El título no puede superar 120 caracteres." };
  if (content.length > 10000) return { ok: false as const, error: "La nota es demasiado larga." };
  if (!KINDS.includes(kind)) return { ok: false as const, error: "Tipo de nota no válido." };
  if (url && !/^https?:\/\//i.test(url)) return { ok: false as const, error: "El enlace debe empezar por http:// o https://" };

  return { ok: true as const, values: { title, content, kind, url: url || null } };
}

export async function saveNote(id: string | null, formData: FormData): Promise<NoteActionResult> {
  await getCurrentUser();
  if (id && !UUID_RE.test(id)) return { ok: false, error: "Nota no válida." };
  const parsed = parseNote(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("notes").update(parsed.values).eq("id", id)
    : await supabase.from("notes").insert(parsed.values);
  if (error) return { ok: false, error: "No se pudo guardar la nota." };

  revalidatePath("/notas");
  return { ok: true };
}

export async function setNotePinned(id: string, pinned: boolean): Promise<NoteActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Nota no válida." };

  const supabase = await createClient();
  const { error } = await supabase.from("notes").update({ pinned }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar la nota." };

  revalidatePath("/notas");
  return { ok: true };
}

export async function deleteNote(id: string): Promise<NoteActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Nota no válida." };

  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar la nota." };

  revalidatePath("/notas");
  return { ok: true };
}
