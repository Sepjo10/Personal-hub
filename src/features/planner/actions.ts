"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions de tareas: se ejecutan en el servidor aunque se llamen desde
 * componentes de cliente. Cada una:
 *  1. Verifica la sesión (getCurrentUser).
 *  2. Valida los datos (nunca nos fiamos de lo que llega del navegador).
 *  3. Escribe en Supabase (RLS garantiza que solo toca tareas propias).
 *  4. revalidatePath() pide a Next.js que vuelva a pintar las vistas con los datos nuevos.
 */

export type TaskActionResult = { ok: boolean; error?: string };

const PRIORITIES = ["low", "medium", "high"] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const UUID_RE = /^[0-9a-f-]{36}$/i;

type TaskValues = {
  title: string;
  description: string | null;
  due_date: string;
  due_time: string | null;
  category: string;
  priority: (typeof PRIORITIES)[number];
};

function parseTask(formData: FormData): { ok: true; values: TaskValues } | { ok: false; error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "");
  const time = String(formData.get("time") ?? "");
  const category = String(formData.get("category") ?? "").trim() || "General";
  const priority = String(formData.get("priority") ?? "medium");

  if (!title) return { ok: false, error: "El título es obligatorio." };
  if (title.length > 200) return { ok: false, error: "El título no puede superar 200 caracteres." };
  if (description.length > 2000) return { ok: false, error: "La descripción es demasiado larga." };
  if (!DATE_RE.test(dueDate)) return { ok: false, error: "Indica una fecha válida." };
  if (time && !TIME_RE.test(time)) return { ok: false, error: "La hora no es válida." };
  if (category.length > 50) return { ok: false, error: "La categoría es demasiado larga." };
  if (!PRIORITIES.includes(priority as TaskValues["priority"])) return { ok: false, error: "Prioridad no válida." };

  return {
    ok: true,
    values: {
      title,
      description: description || null,
      due_date: dueDate,
      due_time: time || null,
      category,
      priority: priority as TaskValues["priority"],
    },
  };
}

function refreshViews() {
  revalidatePath("/", "layout");
}

export async function createTask(formData: FormData): Promise<TaskActionResult> {
  await getCurrentUser();
  const parsed = parseTask(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert(parsed.values);
  if (error) return { ok: false, error: "No se pudo guardar la tarea. Inténtalo de nuevo." };

  refreshViews();
  return { ok: true };
}

export async function updateTask(id: string, formData: FormData): Promise<TaskActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Tarea no válida." };
  const parsed = parseTask(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update(parsed.values).eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar la tarea." };

  refreshViews();
  return { ok: true };
}

export async function setTaskCompleted(id: string, completed: boolean): Promise<TaskActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Tarea no válida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: completed ? "completed" : "pending", completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar la tarea." };

  refreshViews();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<TaskActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Tarea no válida." };

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar la tarea." };

  refreshViews();
  return { ok: true };
}
