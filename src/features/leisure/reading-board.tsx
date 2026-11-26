"use client";

import { useActionState, useState, useTransition } from "react";
import { BookOpen, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/common/date-picker";
import { Modal, fieldClass, labelClass } from "@/components/common/modal";
import { Pill } from "@/components/common/pill";
import { ProgressBar } from "@/components/common/progress-bar";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Book, BookStatus } from "@/types/leisure";
import { deleteBook, saveBook, updateBookProgress, type BookActionResult } from "./books-actions";

const statusInfo: Record<BookStatus, { label: string; className: string }> = {
  reading: { label: "Leyendo", className: "bg-primary/15 text-primary" },
  pending: { label: "Pendiente", className: "bg-white/10 text-muted-foreground" },
  finished: { label: "Terminado", className: "bg-emerald-400/15 text-emerald-300" },
};

const progressOf = (b: Book) => Math.round((b.currentPage / b.totalPages) * 100);

type Editing = { mode: "new" } | { mode: "edit"; book: Book } | null;

/** Lecturas (cliente): libros en curso, resumen del año, biblioteca y modal de edición. */
export function ReadingBoard({ books, year, summary }: { books: Book[]; year: string; summary: { finished: number; pages: number } }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [filter, setFilter] = useState<BookStatus | "all">("all");
  const reading = books.filter((b) => b.status === "reading");
  const library = filter === "all" ? books : books.filter((b) => b.status === filter);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">Leyendo ahora</h2>
            <Button size="sm" onClick={() => setEditing({ mode: "new" })}>
              <Plus />
              Añadir libro
            </Button>
          </div>
          {reading.length === 0 ? (
            <p className="text-sm text-muted-foreground">No estás leyendo ningún libro. Añade uno o marca un pendiente como «Leyendo».</p>
          ) : (
            <div className="space-y-6">
              {reading.map((book) => (
                <CurrentBook key={book.id} book={book} onEdit={() => setEditing({ mode: "edit", book })} />
              ))}
            </div>
          )}
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Resumen {year}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-3xl font-semibold tabular-nums">{summary.finished}</p>
              <p className="text-xs text-muted-foreground">libros terminados</p>
            </div>
            <div>
              <p className="text-3xl font-semibold tabular-nums">{summary.pages.toLocaleString("es-ES")}</p>
              <p className="text-xs text-muted-foreground">páginas leídas</p>
            </div>
          </div>
        </section>
      </div>

      <section className="glass rounded-2xl p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Biblioteca</h2>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "reading", "pending", "finished"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                  filter === s ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-foreground",
                )}
              >
                {s === "all" ? "Todos" : statusInfo[s].label}
              </button>
            ))}
          </div>
        </div>
        {library.length === 0 ? (
          <p className="text-sm text-muted-foreground">{books.length === 0 ? "Tu biblioteca está vacía." : "No hay libros en este estado."}</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {library.map((b) => (
              <li key={b.id}>
                <button type="button" onClick={() => setEditing({ mode: "edit", book: b })} className="flex w-full items-center gap-3 py-3 text-left">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{b.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.author}
                      {b.genre && ` · ${b.genre}`}
                      {b.status === "finished" && b.endDate && ` · terminado el ${formatDate(b.endDate, { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                  </div>
                  {b.rating && (
                    <span className="hidden items-center gap-0.5 text-amber-300 sm:flex" aria-label={`${b.rating} de 5`}>
                      {Array.from({ length: b.rating }, (_, i) => <Star key={i} className="size-3 fill-current" />)}
                    </span>
                  )}
                  {b.status === "reading" && <span className="text-xs tabular-nums text-primary">{progressOf(b)}%</span>}
                  <Pill className={statusInfo[b.status].className}>{statusInfo[b.status].label}</Pill>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.mode === "edit" ? "Editar libro" : "Añadir libro"}>
        {editing && (
          <BookForm
            key={editing.mode === "edit" ? editing.book.id : "new"}
            book={editing.mode === "edit" ? editing.book : undefined}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}

/** Libro en curso con actualización rápida de la página actual. */
function CurrentBook({ book, onEdit }: { book: Book; onEdit: () => void }) {
  const [page, setPage] = useState(String(book.currentPage));
  const [error, setError] = useState<string>();
  const [saving, startSaving] = useTransition();
  const changed = Number(page) !== book.currentPage;

  function save() {
    startSaving(async () => {
      const res = await updateBookProgress(book.id, Number(page));
      setError(res.ok ? undefined : res.error);
    });
  }

  return (
    <div>
      <button type="button" onClick={onEdit} className="flex items-start gap-3 text-left">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <BookOpen className="size-5" />
        </span>
        <span>
          <span className="block text-lg font-semibold leading-tight hover:text-primary">{book.title}</span>
          <span className="text-sm text-muted-foreground">{book.author}</span>
        </span>
      </button>
      <div className="mt-4 mb-1.5 flex justify-between text-sm">
        <span className="text-muted-foreground">
          Página {book.currentPage} de {book.totalPages}
        </span>
        <span className="font-medium text-primary">{progressOf(book)}%</span>
      </div>
      <ProgressBar value={progressOf(book)} />
      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label htmlFor={`page-${book.id}`} className="text-xs text-muted-foreground">Voy por la página</label>
        <input
          id={`page-${book.id}`}
          value={page}
          onChange={(e) => setPage(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          className={cn(fieldClass, "h-8 w-20 tabular-nums")}
        />
        <Button type="submit" size="sm" variant="outline" disabled={!changed || saving}>
          {saving ? "Guardando…" : "Actualizar"}
        </Button>
      </form>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function BookForm({ book, onDone }: { book?: Book; onDone: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [result, formAction, pending] = useActionState<BookActionResult, FormData>(async (_prev, formData) => {
    const res = await saveBook(book?.id ?? null, formData);
    if (res.ok) onDone();
    return res;
  }, { ok: true });

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="b-title" className={labelClass}>Título</label>
          <input id="b-title" name="title" required maxLength={200} defaultValue={book?.title} autoFocus className={fieldClass} />
        </div>
        <div>
          <label htmlFor="b-author" className={labelClass}>Autor</label>
          <input id="b-author" name="author" maxLength={120} defaultValue={book?.author} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="b-genre" className={labelClass}>Género (opcional)</label>
          <input id="b-genre" name="genre" maxLength={60} defaultValue={book?.genre} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="b-status" className={labelClass}>Estado</label>
          <select id="b-status" name="status" defaultValue={book?.status ?? "reading"} className={fieldClass}>
            <option value="reading">Leyendo</option>
            <option value="pending">Pendiente</option>
            <option value="finished">Terminado</option>
          </select>
        </div>
        <div>
          <label htmlFor="b-rating" className={labelClass}>Valoración</label>
          <select id="b-rating" name="rating" defaultValue={book?.rating ? String(book.rating) : ""} className={fieldClass}>
            <option value="">Sin valorar</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{"★".repeat(n)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="b-current" className={labelClass}>Página actual</label>
          <input id="b-current" name="currentPage" inputMode="numeric" defaultValue={book?.currentPage ?? 0} className={`${fieldClass} tabular-nums`} />
        </div>
        <div>
          <label htmlFor="b-total" className={labelClass}>Páginas totales</label>
          <input id="b-total" name="totalPages" required inputMode="numeric" defaultValue={book?.totalPages} className={`${fieldClass} tabular-nums`} />
        </div>
        <div>
          <label htmlFor="b-start" className={labelClass}>Inicio</label>
          <DatePicker id="b-start" name="startDate" defaultValue={book?.startDate} allowEmpty />
        </div>
        <div>
          <label htmlFor="b-end" className={labelClass}>Fin</label>
          <DatePicker id="b-end" name="endDate" defaultValue={book?.endDate} allowEmpty />
        </div>
        <div className="col-span-2">
          <label htmlFor="b-notes" className={labelClass}>Notas y reflexiones</label>
          <textarea id="b-notes" name="notes" rows={3} maxLength={10000} defaultValue={book?.notes} className={`${fieldClass} h-auto py-2`} />
        </div>
      </div>

      {!result.ok && result.error && <p role="alert" className="text-sm text-destructive">{result.error}</p>}

      <div className="flex items-center justify-between gap-2 pt-2">
        {book ? (
          confirmDelete ? (
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => startDelete(async () => { if ((await deleteBook(book.id)).ok) onDone(); })}
            >
              {deleting ? "Eliminando…" : "¿Seguro? Eliminar"}
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)} className="text-muted-foreground">Eliminar</Button>
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
