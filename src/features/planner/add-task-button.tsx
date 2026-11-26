"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskDialog } from "./task-dialog";

/** Botón pequeño "+ Añadir" que abre el diálogo con una fecha ya elegida. */
export function AddTaskButton({ dueDate, label = "Añadir", className }: { dueDate?: string; label?: string; className?: string }) {
  const { openCreate } = useTaskDialog();
  return (
    <button
      type="button"
      onClick={() => openCreate({ dueDate })}
      aria-label={label || "Añadir tarea"}
      className={cn("inline-flex items-center gap-1 text-xs text-primary hover:underline", className)}
    >
      <Plus className="size-3.5" />
      {label}
    </button>
  );
}
