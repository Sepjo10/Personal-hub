import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navButton =
  "grid size-8 place-items-center rounded-lg border border-input bg-input/30 text-foreground transition-colors hover:bg-input/50";

/**
 * Título del periodo con flechas. Son enlaces normales (<Link>) a la misma
 * página con otra ?fecha=..., así que funcionan sin JavaScript y con "atrás".
 */
export function DateNav({
  label,
  prevHref,
  nextHref,
  todayHref,
}: {
  label: string;
  prevHref: string;
  nextHref: string;
  todayHref?: string; // solo si NO estamos ya en el periodo actual
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="text-lg font-medium capitalize">{label}</h2>
      <div className="flex items-center gap-1">
        {todayHref && (
          <Link href={todayHref} className={cn(navButton, "w-auto px-3 text-sm")}>
            Hoy
          </Link>
        )}
        <Link href={prevHref} aria-label="Anterior" className={navButton}>
          <ChevronLeft className="size-4" />
        </Link>
        <Link href={nextHref} aria-label="Siguiente" className={navButton}>
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
