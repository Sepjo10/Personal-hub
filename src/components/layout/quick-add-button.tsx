"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskDialog } from "@/features/planner/task-dialog";

/**
 * Botón flotante de "Nueva tarea" para escritorio.
 * En móvil este acceso está en el centro de la barra inferior.
 */
export function QuickAddButton() {
  const { openCreate } = useTaskDialog();
  return (
    <Button
      size="lg"
      onClick={() => openCreate()}
      className="fixed right-8 bottom-8 z-30 hidden h-11 rounded-full px-5 shadow-lg shadow-primary/30 md:inline-flex"
    >
      <Plus />
      Nueva tarea
    </Button>
  );
}
