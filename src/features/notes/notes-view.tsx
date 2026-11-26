import { getToday } from "@/lib/today";
import { getNotes } from "./data";
import { NotesBoard } from "./notes-board";

/**
 * Vista de Notas (servidor): carga los datos y se los pasa al tablero interactivo (cliente).
 * Este reparto servidor/cliente es el patrón que seguiremos en todos los módulos.
 */
export async function NotesView() {
  const [today, notes] = await Promise.all([getToday(), getNotes()]);
  return <NotesBoard notes={notes} today={today} />;
}
