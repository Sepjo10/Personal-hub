import type { Priority } from "@/types/planner";

// Estilos y textos de cada prioridad, reutilizables en todo el planificador.
export const priorityStyles: Record<Priority, { label: string; dot: string; badge: string }> = {
  high: { label: "Alta", dot: "bg-rose-400", badge: "bg-rose-400/15 text-rose-300" },
  medium: { label: "Media", dot: "bg-amber-400", badge: "bg-amber-400/15 text-amber-300" },
  low: { label: "Baja", dot: "bg-emerald-400", badge: "bg-emerald-400/15 text-emerald-300" },
};

const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function byPriority<T extends { priority: Priority }>(a: T, b: T): number {
  return order[a.priority] - order[b.priority];
}
