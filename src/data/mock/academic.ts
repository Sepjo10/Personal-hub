import { addDays } from "@/lib/dates";
import type { AcademicDate, ClassSession, JobApplication, Subject } from "@/types/academic";

// DATOS FICTICIOS. Se sustituirán por Supabase en la Fase 5.

export const mockSubjects: Subject[] = [
  { id: "s1", name: "Sistemas Inteligentes", code: "SIN", professor: "Dra. García", progress: 65 },
  { id: "s2", name: "Redes de Computadores", code: "RED", professor: "Dr. Martínez", progress: 50 },
  { id: "s3", name: "Algoritmia", code: "ALG", professor: "Dra. López", progress: 40 },
  { id: "s4", name: "Bases de Datos", code: "BDA", professor: "Dr. Ruiz", progress: 75 },
];

export const mockSchedule: ClassSession[] = [
  { id: "c1", subjectId: "s1", weekday: 0, start: "09:00", end: "10:30", room: "1G 0.3" },
  { id: "c2", subjectId: "s3", weekday: 0, start: "11:00", end: "12:30", room: "1G 1.2" },
  { id: "c3", subjectId: "s2", weekday: 1, start: "15:00", end: "17:00", room: "Lab 2" },
  { id: "c4", subjectId: "s4", weekday: 2, start: "09:00", end: "10:30", room: "1G 0.1" },
  { id: "c5", subjectId: "s1", weekday: 3, start: "09:00", end: "10:30", room: "1G 0.3" },
  { id: "c6", subjectId: "s3", weekday: 4, start: "11:00", end: "12:30", room: "1G 1.2" },
];

export function getMockAcademicDates(today: string): AcademicDate[] {
  return [
    { id: "a1", subjectId: "s4", title: "Entrega memoria", date: addDays(today, 2), kind: "deadline" },
    { id: "a2", subjectId: "s3", title: "Examen parcial", date: addDays(today, 5), kind: "exam" },
    { id: "a3", subjectId: "s2", title: "Práctica 4", date: addDays(today, 12), kind: "deadline" },
    { id: "a4", subjectId: "s1", title: "Examen final", date: addDays(today, 40), kind: "exam" },
  ];
}

export function getMockApplications(today: string): JobApplication[] {
  return [
    { id: "j1", company: "Indra", position: "Prácticas desarrollo backend", appliedOn: addDays(today, -12), status: "interview", interviews: [addDays(today, 3)], nextStep: "Entrevista técnica" },
    { id: "j2", company: "Mercadona Tech", position: "Prácticas Data Engineering", appliedOn: addDays(today, -6), status: "sent", interviews: [], nextStep: "Esperar respuesta" },
    { id: "j3", company: "Startup local", position: "Desarrollo web (Next.js)", status: "pending", interviews: [], nextStep: "Adaptar CV y enviar" },
    { id: "j4", company: "Accenture", position: "Becario Cloud", appliedOn: addDays(today, -30), status: "rejected", interviews: [addDays(today, -20)], notes: "Pedían más experiencia en AWS." },
  ];
}
