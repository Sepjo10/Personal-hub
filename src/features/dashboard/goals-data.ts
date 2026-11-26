import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { DailyGoal } from "@/types/planner";

type GoalRow = { id: string; label: string; target: number; step: number; unit: string };
type LogRow = { goal_id: string; value: number };

/** Mis objetivos con lo que llevo en la fecha indicada (0 si aún no hay registro). */
export async function getGoalsForDay(date: string): Promise<DailyGoal[]> {
  await getCurrentUser();
  const supabase = await createClient();

  const [goals, logs] = await Promise.all([
    supabase.from("daily_goals").select("id, label, target, step, unit").order("created_at"),
    supabase.from("goal_logs").select("goal_id, value").eq("log_date", date),
  ]);
  if (goals.error) throw new Error(`No se pudieron cargar los objetivos: ${goals.error.message}`);
  if (logs.error) throw new Error(`No se pudo cargar el progreso: ${logs.error.message}`);

  const progress = new Map((logs.data as LogRow[]).map((l) => [l.goal_id, Number(l.value)]));

  return (goals.data as GoalRow[]).map((g) => ({
    id: g.id,
    label: g.label,
    target: Number(g.target),
    step: Number(g.step),
    unit: g.unit,
    current: progress.get(g.id) ?? 0,
  }));
}
