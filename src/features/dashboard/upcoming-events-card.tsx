import { Panel } from "@/components/common/panel";
import { relativeDayLabel } from "@/lib/dates";
import type { CalendarEvent, EventKind } from "@/types/planner";

const kindLabel: Record<EventKind, { label: string; className: string }> = {
  exam: { label: "Examen", className: "bg-rose-400/15 text-rose-300" },
  deadline: { label: "Entrega", className: "bg-amber-400/15 text-amber-300" },
  class: { label: "Clase", className: "bg-sky-400/15 text-sky-300" },
  personal: { label: "Personal", className: "bg-primary/15 text-primary" },
};

/** Próximos eventos a partir de mañana (los de hoy ya están en la agenda). */
export function UpcomingEventsCard({ events, today }: { events: CalendarEvent[]; today: string }) {
  const upcoming = events
    .filter((e) => e.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <Panel title="Próximos eventos">
      <ul className="space-y-3">
        {upcoming.map((event) => (
          <li key={event.id} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs font-medium capitalize text-muted-foreground">
              {relativeDayLabel(event.date, today)}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm">{event.title}</p>
            <span className={`rounded-md px-2 py-0.5 text-[11px] ${kindLabel[event.kind].className}`}>
              {kindLabel[event.kind].label}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
