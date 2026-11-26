import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Botón flotante de "Nueva tarea" para escritorio.
 * En móvil este acceso está en el centro de la barra inferior.
 * De momento es solo visual: el formulario de tareas llega en la Fase 3.
 */
export function QuickAddButton() {
  return (
    <Button
      size="lg"
      className="fixed right-8 bottom-8 z-30 hidden h-11 rounded-full px-5 shadow-lg shadow-primary/30 md:inline-flex"
    >
      <Plus />
      Nueva tarea
    </Button>
  );
}
