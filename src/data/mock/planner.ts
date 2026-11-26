import { addDays } from "@/lib/dates";
import type { CalendarEvent, DailyGoal, Task } from "@/types/planner";

/**
 * DATOS FICTICIOS para el desarrollo visual (Fases 2-4).
 * Se generan a partir de la fecha de hoy para que siempre parezcan actuales.
 * En la Fase 5 se sustituirán por consultas a Supabase con la misma forma (tipos).
 */

export function getMockTasks(today: string): Task[] {
  return [
    { id: "t1", title: "Terminar práctica 3 de Redes", dueDate: today, time: "11:00", category: "Universidad", priority: "high", status: "pending" },
    { id: "t2", title: "Repasar tema 5 de Algoritmia", dueDate: today, category: "Universidad", priority: "high", status: "pending" },
    { id: "t3", title: "Enviar CV a la oferta de prácticas", dueDate: today, time: "17:30", category: "Carrera", priority: "medium", status: "pending" },
    { id: "t4", title: "Pagar la cuota del gimnasio", dueDate: today, category: "Personal", priority: "low", status: "completed" },
    { id: "t5", title: "Responder correo del tutor", dueDate: today, category: "Universidad", priority: "medium", status: "completed" },
    { id: "t6", title: "Comprar billetes para Navidad", dueDate: addDays(today, 1), category: "Personal", priority: "medium", status: "pending" },
  ];
}

export function getMockEvents(today: string): CalendarEvent[] {
  return [
    { id: "e1", title: "Clase de Sistemas Inteligentes", date: today, startTime: "09:00", endTime: "10:30", location: "1G 0.3", kind: "class" },
    { id: "e2", title: "Laboratorio de Redes", date: today, startTime: "15:00", endTime: "17:00", location: "Lab 2", kind: "class" },
    { id: "e3", title: "Cena con amigos", date: today, startTime: "21:00", kind: "personal" },
    { id: "e4", title: "Entrega memoria de Bases de Datos", date: addDays(today, 2), kind: "deadline" },
    { id: "e5", title: "Examen parcial de Algoritmia", date: addDays(today, 5), startTime: "10:00", kind: "exam" },
    { id: "e6", title: "Concierto", date: addDays(today, 8), startTime: "20:30", kind: "personal" },
  ];
}

export function getMockGoals(): DailyGoal[] {
  return [
    { id: "g1", label: "Estudio", current: 2, target: 4, unit: "h" },
    { id: "g2", label: "Lectura", current: 20, target: 30, unit: "págs" },
    { id: "g3", label: "Ejercicio", current: 1, target: 1, unit: "sesión" },
  ];
}
