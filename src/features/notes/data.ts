import { getCurrentUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { Note, NoteKind } from "@/types/note";

type NoteRow = {
  id: string;
  title: string;
  content: string;
  kind: NoteKind;
  url: string | null;
  pinned: boolean;
  updated_at: string;
};

/** Todas mis notas: fijadas primero y después las más recientes. */
export async function getNotes(): Promise<Note[]> {
  await getCurrentUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("id, title, content, kind, url, pinned, updated_at")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar las notas: ${error.message}`);

  return (data as NoteRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    kind: row.kind,
    url: row.url ?? undefined,
    pinned: row.pinned,
    updatedAt: todayISO(new Date(row.updated_at)),
  }));
}
