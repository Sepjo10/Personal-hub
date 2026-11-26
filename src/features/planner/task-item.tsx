"use client";

import { useOptimistic, useTransition } from "react";
import { Circle, CircleCheck, Clock } from "lucide-react";
import { Pill } from "@/components/common/pill";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/planner";
import { priorityStyles } from "@/features/dashboard/priority";
import { setTaskCompleted } from "./actions";
import { useTaskDialog } from "./task-dialog";

/**
 * Una tarea de la lista: el círculo la marca como completada y el resto abre la edición.
 * useOptimistic muestra el cambio al instante, antes de que responda el servidor;
 * si algo falla, React vuelve al estado real automáticamente.
 */
export function TaskItem({ task }: { task: Task }) {
  const { openEdit } = useTaskDialog();
  const [, startTransition] = useTransition();
  const [done, setOptimisticDone] = useOptimistic(task.status === "completed");
  const Icon = done ? CircleCheck : Circle;

  function toggle() {
    startTransition(async () => {
      setOptimisticDone(!done);
      await setTaskCompleted(task.id, !done);
    });
  }

  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <button
        type="button"
        onClick={toggle}
        aria-label={done ? "Marcar como pendiente" : "Marcar como completada"}
        className="rounded-full transition-transform active:scale-90"
      >
        <Icon className={cn("size-5", done ? "text-primary" : "text-muted-foreground hover:text-foreground")} />
      </button>
      <button type="button" onClick={() => openEdit(task)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-medium", done && "text-muted-foreground line-through")}>{task.title}</p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.category}
            {task.time && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {task.time}
              </span>
            )}
          </p>
        </div>
        {!done && <Pill className={priorityStyles[task.priority].badge}>{priorityStyles[task.priority].label}</Pill>}
      </button>
    </li>
  );
}
