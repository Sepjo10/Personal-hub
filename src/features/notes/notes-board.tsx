"use client";

import { useActionState, useState, useTransition } from "react";
import { ExternalLink, Pin, PinOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, fieldClass, labelClass } from "@/components/common/modal";
import { Pill } from "@/components/common/pill";
import { relativeDayLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Note, NoteKind } from "@/types/note";
import { deleteNote, saveNote, setNotePinned, type NoteActionResult } from "./actions";
import { kindStyles } from "./note-styles";

type Editing = { mode: "new" } | { mode: "edit"; note: Note } | null;

/**
 * Tablero de notas (cliente): muestra las tarjetas y gestiona el modal de crear/editar.
 * Los datos llegan ya cargados desde el servidor (NotesView); aquí solo hay interacción.
 */
export function NotesBoard({ notes, today }: { notes: Note[]; today: string }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [filter, setFilter] = useState<NoteKind | "all">("all");
  const visible = filter === "all" ? notes : notes.filter((n) => n.kind === filter);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>Todas</FilterChip>
          {(Object.keys(kindStyles) as NoteKind[]).map((kind) => (
            <FilterChip key={kind} active={filter === kind} onClick={() => setFilter(kind)}>
              {kindStyles[kind].label}
            </FilterChip>
          ))}
        </div>
        <Button onClick={() => setEditing({ mode: "new" })}>
          <Plus />
          Nueva nota
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">
          {notes.length === 0 ? "Aún no tienes notas. Crea la primera con «Nueva nota»." : "No hay notas de este tipo."}
        </p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {visible.map((note) => (
            <NoteCard key={note.id} note={note} today={today} onEdit={() => setEditing({ mode: "edit", note })} />
          ))}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.mode === "edit" ? "Editar nota" : "Nueva nota"}>
        {editing && (
          <NoteForm
            key={editing.mode === "edit" ? editing.note.id : "new"}
            note={editing.mode === "edit" ? editing.note : undefined}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function NoteCard({ note, today, onEdit }: { note: Note; today: string; onEdit: () => void }) {
  const [, startTransition] = useTransition();
  const PinIcon = note.pinned ? PinOff : Pin;

  return (
    <article className="glass group mb-4 break-inside-avoid rounded-2xl p-5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <button type="button" onClick={onEdit} className="text-left font-medium hover:text-primary">
          {note.title}
        </button>
        <button
          type="button"
          onClick={() => startTransition(async () => void (await setNotePinned(note.id, !note.pinned)))}
          aria-label={note.pinned ? "Desfijar" : "Fijar"}
          className={cn("shrink-0 rounded p-0.5", note.pinned ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100 max-md:opacity-100")}
        >
          <PinIcon className="size-4" />
        </button>
      </div>
      {note.content && (
        <button type="button" onClick={onEdit} className="block w-full whitespace-pre-line text-left text-sm leading-relaxed text-foreground/80">
          {note.content}
        </button>
      )}
      {note.url && (
        <a href={note.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-sm text-primary hover:underline">
          <ExternalLink className="size-3.5 shrink-0" />
          <span className="truncate">{note.url.replace(/^https?:\/\//, "")}</span>
        </a>
      )}
      <div className="mt-4 flex items-center justify-between">
        <Pill className={kindStyles[note.kind].className}>{kindStyles[note.kind].label}</Pill>
        <span className="text-xs capitalize text-muted-foreground">{relativeDayLabel(note.updatedAt, today)}</span>
      </div>
    </article>
  );
}

function NoteForm({ note, onDone }: { note?: Note; onDone: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [result, formAction, pending] = useActionState<NoteActionResult, FormData>(async (_prev, formData) => {
    const res = await saveNote(note?.id ?? null, formData);
    if (res.ok) onDone();
    return res;
  }, { ok: true });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="note-title" className={labelClass}>Título</label>
        <input id="note-title" name="title" required maxLength={120} defaultValue={note?.title} autoFocus className={fieldClass} />
      </div>
      <div>
        <label htmlFor="note-content" className={labelClass}>Contenido</label>
        <textarea id="note-content" name="content" rows={6} maxLength={10000} defaultValue={note?.content} className={`${fieldClass} h-auto py-2`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="note-kind" className={labelClass}>Tipo</label>
          <select id="note-kind" name="kind" defaultValue={note?.kind ?? "quick"} className={fieldClass}>
            {(Object.keys(kindStyles) as NoteKind[]).map((kind) => (
              <option key={kind} value={kind}>{kindStyles[kind].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="note-url" className={labelClass}>Enlace (opcional)</label>
          <input id="note-url" name="url" type="url" placeholder="https://" defaultValue={note?.url} className={fieldClass} />
        </div>
      </div>

      {!result.ok && result.error && <p role="alert" className="text-sm text-destructive">{result.error}</p>}

      <div className="flex items-center justify-between gap-2 pt-2">
        {note ? (
          confirmDelete ? (
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => startDelete(async () => { if ((await deleteNote(note.id)).ok) onDone(); })}
            >
              {deleting ? "Eliminando…" : "¿Seguro? Eliminar"}
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)} className="text-muted-foreground">
              Eliminar
            </Button>
          )
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
          <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</Button>
        </div>
      </div>
    </form>
  );
}
