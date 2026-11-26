import { cn } from "@/lib/utils";

/** Barra de progreso; value entre 0 y 100. */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
      <div className={cn("h-full rounded-full bg-primary transition-all", className)} style={{ width: `${width}%` }} />
    </div>
  );
}
