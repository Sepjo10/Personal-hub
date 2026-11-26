"use client";

import { cn } from "@/lib/utils";
import type { Task } from "@/types/planner";
import { useTaskDialog } from "./task-dialog";

/** Tarea compacta para la vista Semana; al pulsarla se abre la edición. */
export function TaskChip({ task }: { task: Task }) {
  const { openEdit } = useTaskDialog();
  return (
    <button
      type="button"
      onClick={() => openEdit(task)}
      className={cn(
        "w-full truncate rounded-md bg-white/5 px-2 py-1 text-left hover:bg-white/10",
        task.status === "completed" && "text-muted-foreground line-through",
      )}
    >
      {task.time && <span className="text-muted-foreground">{task.time} </span>}
      {task.title}
    </button>
  );
}
