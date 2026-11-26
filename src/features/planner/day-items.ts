import type { CalendarEvent, Task } from "@/types/planner";

/** Tareas y eventos de un día concreto, ordenados por hora (sin hora al final). */
export function itemsForDate(date: string, tasks: Task[], events: CalendarEvent[]) {
  const dayEvents = events
    .filter((e) => e.date === date)
    .sort((a, b) => (a.startTime ?? "99").localeCompare(b.startTime ?? "99"));
  const dayTasks = tasks
    .filter((t) => t.dueDate === date)
    .sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99"));
  return { events: dayEvents, tasks: dayTasks };
}
