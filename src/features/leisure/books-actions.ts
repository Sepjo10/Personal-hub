"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { isValidISODate, todayISO } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export type BookActionResult = { ok: boolean; error?: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;
const STATUSES = ["pending", "reading", "finished"];

const toInt = (v: FormDataEntryValue | null) => (v === null || String(v).trim() === "" ? NaN : Number(v));

/**
 * Reglas automáticas para que los datos sean coherentes:
 * - "Terminado" -> página actual = total y fecha de fin = hoy (si no se indicó).
 * - "Leyendo" sin fecha de inicio -> hoy.
 */
function applyStatusRules(values: {
  status: string;
  current_page: number;
  total_pages: number;
  start_date: string | null;
  end_date: string | null;
}) {
  const today = todayISO();
  if (values.status === "finished") {
    values.current_page = values.total_pages;
    values.end_date ??= today;
  }
  if (values.status === "reading") values.start_date ??= today;
  if (values.status !== "finished") values.end_date = null;
  return values;
}

function parseBook(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const genre = String(formData.get("genre") ?? "").trim();
  const status = String(formData.get("status") ?? "pending");
  const currentPage = toInt(formData.get("currentPage")) || 0;
  const totalPages = toInt(formData.get("totalPages"));
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const rating = String(formData.get("rating") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!title) return { ok: false as const, error: "El título es obligatorio." };
  if (title.length > 200 || author.length > 120 || genre.length > 60) return { ok: false as const, error: "Algún campo es demasiado largo." };
  if (!STATUSES.includes(status)) return { ok: false as const, error: "Estado no válido." };
  if (!Number.isInteger(totalPages) || totalPages <= 0) return { ok: false as const, error: "Indica el número total de páginas." };
  if (!Number.isInteger(currentPage) || currentPage < 0 || currentPage > totalPages) return { ok: false as const, error: "La página actual debe estar entre 0 y el total." };
  if (startDate && !isValidISODate(startDate)) return { ok: false as const, error: "Fecha de inicio no válida." };
  if (endDate && !isValidISODate(endDate)) return { ok: false as const, error: "Fecha de fin no válida." };
  if (startDate && endDate && endDate < startDate) return { ok: false as const, error: "La fecha de fin no puede ser anterior a la de inicio." };
  if (rating && !["1", "2", "3", "4", "5"].includes(rating)) return { ok: false as const, error: "Valoración no válida." };
  if (notes.length > 10000) return { ok: false as const, error: "Las notas son demasiado largas." };

  return {
    ok: true as const,
    values: {
      title,
      author,
      genre: genre || null,
      notes: notes || null,
      rating: rating ? Number(rating) : null,
      ...applyStatusRules({ status, current_page: currentPage, total_pages: totalPages, start_date: startDate || null, end_date: endDate || null }),
    },
  };
}

export async function saveBook(id: string | null, formData: FormData): Promise<BookActionResult> {
  await getCurrentUser();
  if (id && !UUID_RE.test(id)) return { ok: false, error: "Libro no válido." };
  const parsed = parseBook(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("books").update(parsed.values).eq("id", id)
    : await supabase.from("books").insert(parsed.values);
  if (error) return { ok: false, error: "No se pudo guardar el libro." };

  revalidatePath("/ocio/lecturas");
  return { ok: true };
}

/** Actualización rápida de la página actual. Si llega al final, marca el libro como terminado. */
export async function updateBookProgress(id: string, currentPage: number): Promise<BookActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Libro no válido." };

  const supabase = await createClient();
  // El total se lee de la base de datos: no nos fiamos del valor que envía el navegador
  const { data: book, error: readError } = await supabase.from("books").select("total_pages").eq("id", id).single();
  if (readError || !book) return { ok: false, error: "Libro no encontrado." };

  const total = book.total_pages as number;
  if (!Number.isInteger(currentPage) || currentPage < 0 || currentPage > total) {
    return { ok: false, error: `La página debe estar entre 0 y ${total}.` };
  }

  const finished = currentPage === total;
  const { error } = await supabase
    .from("books")
    .update(finished ? { current_page: currentPage, status: "finished", end_date: todayISO() } : { current_page: currentPage })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar el progreso." };

  revalidatePath("/ocio/lecturas");
  return { ok: true };
}

export async function deleteBook(id: string): Promise<BookActionResult> {
  await getCurrentUser();
  if (!UUID_RE.test(id)) return { ok: false, error: "Libro no válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar el libro." };

  revalidatePath("/ocio/lecturas");
  return { ok: true };
}
