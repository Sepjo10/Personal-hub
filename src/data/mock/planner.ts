import type { DailyGoal } from "@/types/planner";

/**
 * DATOS FICTICIOS: solo quedan los objetivos diarios del dashboard.
 * Tareas y eventos ya vienen de Supabase.
 */

export function getMockGoals(): DailyGoal[] {
  return [
    { id: "g1", label: "Estudio", current: 2, target: 4, unit: "h" },
    { id: "g2", label: "Lectura", current: 20, target: 30, unit: "págs" },
    { id: "g3", label: "Ejercicio", current: 1, target: 1, unit: "sesión" },
  ];
}
