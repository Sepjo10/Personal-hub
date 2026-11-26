import { Pin } from "lucide-react";
import { Pill } from "@/components/common/pill";
import { relativeDayLabel } from "@/lib/dates";
import { getToday } from "@/lib/today";
import { getMockNotes } from "@/data/mock/notes";
import type { NoteKind } from "@/types/note";

const kindStyles: Record<NoteKind, { label: string; className: string }> = {
  quick: { label: "Rápida", className: "bg-white/10 text-muted-foreground" },
  important: { label: "Importante", className: "bg-rose-400/15 text-rose-300" },
  resource: { label: "Recurso", className: "bg-sky-400/15 text-sky-300" },
  link: { label: "Enlace", className: "bg-primary/15 text-primary" },
};

/** Notas: tarjetas en columnas; las fijadas aparecen primero. */
export async function NotesView() {
  const today = await getToday();
  const notes = getMockNotes(today).sort(
    (a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false) || b.updatedAt.localeCompare(a.updatedAt),
  );

  return (
    <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
      {notes.map((note) => (
        <article key={note.id} className="glass mb-4 break-inside-avoid rounded-2xl p-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h2 className="font-medium">{note.title}</h2>
            {note.pinned && <Pin className="size-4 shrink-0 text-primary" />}
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{note.content}</p>
          <div className="mt-4 flex items-center justify-between">
            <Pill className={kindStyles[note.kind].className}>{kindStyles[note.kind].label}</Pill>
            <span className="text-xs capitalize text-muted-foreground">{relativeDayLabel(note.updatedAt, today)}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
