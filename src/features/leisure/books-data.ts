import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Book, BookStatus } from "@/types/leisure";

type BookRow = {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  status: BookStatus;
  current_page: number;
  total_pages: number;
  start_date: string | null;
  end_date: string | null;
  rating: number | null;
  notes: string | null;
};

/** Todos mis libros (biblioteca personal: pocos registros, se cargan de una vez). */
export async function getBooks(): Promise<Book[]> {
  await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, genre, status, current_page, total_pages, start_date, end_date, rating, notes")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar los libros: ${error.message}`);

  return (data as BookRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    author: r.author,
    genre: r.genre ?? undefined,
    status: r.status,
    currentPage: r.current_page,
    totalPages: r.total_pages,
    startDate: r.start_date ?? undefined,
    endDate: r.end_date ?? undefined,
    rating: r.rating ?? undefined,
    notes: r.notes ?? undefined,
  }));
}
