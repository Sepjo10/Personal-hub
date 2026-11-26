import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Priority, Task, TaskStatus } from "@/types/planner";

/**
 * Capa de acceso a datos de TAREAS (solo servidor).
 * - Cada función verifica primero la sesión (getCurrentUser).
 * - Además, RLS en Supabase impide ver tareas de otros usuarios aunque
 *   alguien se saltara esta comprobación: dos capas de seguridad.
 * - Traduce las columnas de la base de datos (snake_case) a nuestro tipo Task (camelCase).
 */

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  due_time: string | null;
  category: string;
  priority: Priority;
  status: TaskStatus;
};

const COLUMNS = "id, title, description, due_date, due_time, category, priority, status";

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    dueDate: row.due_date,
    time: row.due_time?.slice(0, 5) ?? undefined, // "09:30:00" -> "09:30"
    category: row.category,
    priority: row.priority,
    status: row.status,
  };
}

/** Tareas con fecha límite entre from y to (ambas incluidas, formato AAAA-MM-DD). */
export async function getTasksInRange(from: string, to: string): Promise<Task[]> {
  await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(COLUMNS)
    .gte("due_date", from)
    .lte("due_date", to)
    .order("due_date")
    .order("due_time", { nullsFirst: false });

  if (error) throw new Error(`No se pudieron cargar las tareas: ${error.message}`);
  return (data as TaskRow[]).map(toTask);
}
