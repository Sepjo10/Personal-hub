import { cn } from "@/lib/utils";

/** Etiqueta pequeña de color (estado, tipo, prioridad...). */
export function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-medium", className)}>
      {children}
    </span>
  );
}
