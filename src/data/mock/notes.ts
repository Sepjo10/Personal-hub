import { addDays } from "@/lib/dates";
import type { Note } from "@/types/note";

// DATOS FICTICIOS. Se sustituirán por Supabase en la Fase 5.
export function getMockNotes(today: string): Note[] {
  return [
    { id: "n1", title: "Wifi de la biblioteca", content: "Red: UPVNET · usuario con DNI. Si falla, usar eduroam.", kind: "important", pinned: true, updatedAt: addDays(today, -3) },
    { id: "n2", title: "Ideas para el TFG", content: "Algo con visión por computador o un sistema de recomendación. Hablar con la tutora en enero.", kind: "quick", updatedAt: addDays(today, -1) },
    { id: "n3", title: "Documentación de Next.js", content: "nextjs.org/docs: App Router, Server Components, caché.", kind: "link", updatedAt: addDays(today, -7) },
    { id: "n4", title: "Curso de SQL", content: "Repasar joins y subconsultas antes del examen de BDA.", kind: "resource", updatedAt: addDays(today, -10) },
    { id: "n5", title: "Lista de la compra", content: "Café, avena, fruta, pasta.", kind: "quick", updatedAt: today },
  ];
}
