"use client";

import { createContext, use, useActionState, useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/common/date-picker";
import { TimeField } from "@/components/common/time-field";
import { todayISO } from "@/lib/dates";
import type { Task } from "@/types/planner";
import { createTask, deleteTask, updateTask, type TaskActionResult } from "./actions";

/**
 * Diálogo único para crear y editar tareas, accesible desde cualquier vista.
 * Un "contexto" de React expone openCreate() y openEdit() a cualquier componente
 * de la app sin tener que pasar funciones de un componente a otro.
 * Usa el elemento nativo <dialog> del navegador: accesible y sin dependencias.
 */

type DialogState = { mode: "create"; dueDate?: string } | { mode: "edit"; task: Task } | null;

type TaskDialogApi = {
  openCreate: (options?: { dueDate?: string }) => void;
  openEdit: (task: Task) => void;
};

const TaskDialogContext = createContext<TaskDialogApi | null>(null);

export function useTaskDialog(): TaskDialogApi {
  const api = use(TaskDialogContext);
  if (!api) throw new Error("useTaskDialog debe usarse dentro de <TaskDialogProvider>");
  return api;
}

export function TaskDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (state && !dialog.open) dialog.showModal();
    if (!state && dialog.open) dialog.close();
  }, [state]);

  const api: TaskDialogApi = {
    openCreate: (options) => setState({ mode: "create", dueDate: options?.dueDate }),
    openEdit: (task) => setState({ mode: "edit", task }),
  };

  return (
    <TaskDialogContext value={api}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={() => setState(null)}
        className="m-auto w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border bg-popover p-0 text-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        {state && (
          <TaskForm
            key={state.mode === "edit" ? state.task.id : "new"}
            state={state}
            onDone={() => setState(null)}
          />
        )}
      </dialog>
    </TaskDialogContext>
  );
}

/** Categorías de las tareas (un <select> normal: <datalist> filtraba y solo mostraba la ya escrita). */
const CATEGORIES = ["General", "Universidad", "Carrera", "Personal", "Finanzas", "Ocio"];

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-white/5 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";
const labelClass = "mb-1.5 block text-sm text-muted-foreground";

function TaskForm({ state, onDone }: { state: NonNullable<DialogState>; onDone: () => void }) {
  const task = state.mode === "edit" ? state.task : undefined;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();

  // useActionState guarda el resultado de la última acción (p. ej. un error de validación)
  const [result, formAction, pending] = useActionState<TaskActionResult, FormData>(async (_prev, formData) => {
    const res = task ? await updateTask(task.id, formData) : await createTask(formData);
    if (res.ok) onDone();
    return res;
  }, { ok: true });

  function handleDelete() {
    if (!task) return;
    startDelete(async () => {
      const res = await deleteTask(task.id);
      if (res.ok) onDone();
    });
  }

  return (
    <form action={formAction} className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{task ? "Editar tarea" : "Nueva tarea"}</h2>
        <button type="button" onClick={onDone} aria-label="Cerrar" className="rounded-lg p-1 text-muted-foreground hover:bg-white/5">
          <X className="size-5" />
        </button>
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>Título</label>
        <input id="title" name="title" required maxLength={200} defaultValue={task?.title} autoFocus className={fieldClass} />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>Descripción (opcional)</label>
        <textarea id="description" name="description" rows={2} maxLength={2000} defaultValue={task?.description} className={`${fieldClass} h-auto py-2`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="dueDate" className={labelClass}>Fecha</label>
          <DatePicker id="dueDate" name="dueDate" defaultValue={task?.dueDate ?? (state.mode === "create" ? state.dueDate : undefined) ?? todayISO()} />
        </div>
        <div>
          <label htmlFor="time" className={labelClass}>Hora (opcional)</label>
          <TimeField id="time" name="time" defaultValue={task?.time} />
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>Categoría</label>
          <select id="category" name="category" defaultValue={task?.category ?? "General"} className={fieldClass}>
            {/* Si una tarea antigua tiene otra categoría, se conserva como opción */}
            {[...CATEGORIES, ...(task && !CATEGORIES.includes(task.category) ? [task.category] : [])].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className={labelClass}>Prioridad</label>
          <select id="priority" name="priority" defaultValue={task?.priority ?? "medium"} className={fieldClass}>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
      </div>

      {!result.ok && result.error && (
        <p role="alert" className="text-sm text-destructive">{result.error}</p>
      )}

      <div className="flex items-center justify-between gap-2 pt-2">
        {task ? (
          confirmDelete ? (
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
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
