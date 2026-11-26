import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Título del periodo con flechas de navegación (se activarán en la Fase 3). */
export function DateNav({ label }: { label: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-medium capitalize">{label}</h2>
      <div className="flex gap-1">
        <Button variant="outline" size="icon" disabled aria-label="Anterior">
          <ChevronLeft />
        </Button>
        <Button variant="outline" size="icon" disabled aria-label="Siguiente">
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
