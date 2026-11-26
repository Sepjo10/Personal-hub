/**
 * Tipos del planificador. Se comparten entre Inicio, Hoy, Semana y Mes:
 * una misma tarea se muestra en varias vistas sin duplicar datos.
 * Las fechas se guardan como texto ISO "AAAA-MM-DD" y las horas como "HH:mm".
 */

export type Priority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed";

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  time?: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
};

export type EventKind = "class" | "exam" | "deadline" | "personal";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  kind: EventKind;
};

export type DailyGoal = {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
};
