import { addDays } from "@/lib/dates";
import type { Activity, Book } from "@/types/leisure";

// DATOS FICTICIOS. Se sustituirán por Supabase en la Fase 5.

export function getMockBooks(today: string): Book[] {
  const year = today.slice(0, 4);
  return [
    { id: "b1", title: "Clean Code", author: "Robert C. Martin", genre: "Tecnología", status: "reading", currentPage: 212, totalPages: 464, startDate: addDays(today, -18) },
    { id: "b2", title: "El problema de los tres cuerpos", author: "Liu Cixin", genre: "Ciencia ficción", status: "finished", currentPage: 416, totalPages: 416, endDate: `${year}-10-02`, rating: 5 },
    { id: "b3", title: "Hábitos atómicos", author: "James Clear", genre: "Desarrollo personal", status: "finished", currentPage: 328, totalPages: 328, endDate: `${year}-06-20`, rating: 4 },
    { id: "b4", title: "Dune", author: "Frank Herbert", genre: "Ciencia ficción", status: "pending", currentPage: 0, totalPages: 784 },
  ];
}

export function getMockActivities(today: string): Activity[] {
  return [
    { id: "x1", title: "Vuelo Valencia → Madrid", type: "flight", date: addDays(today, 24), time: "07:45", location: "Aeropuerto de Valencia", price: 48, notes: "Facturar online 24 h antes" },
    { id: "x2", title: "Concierto", type: "concert", date: addDays(today, 8), time: "20:30", location: "Roig Arena", price: 35, people: ["Álex", "Marta"] },
    { id: "x3", title: "Revisión dentista", type: "medical", date: addDays(today, 4), time: "12:00", location: "Clínica Benimaclet" },
    { id: "x4", title: "Cine: estreno", type: "cinema", date: addDays(today, 2), time: "22:00", location: "Cines Lys", price: 9.5 },
  ];
}
