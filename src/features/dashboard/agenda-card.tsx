import { CircleCheck, Circle, MapPin } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { cn } from "@/lib/utils";
import type { CalendarEvent, Task } from "@/types/planner";

// Un elemento de la agenda puede ser un evento o una tarea con hora.
type AgendaItem =
  | { type: "event"; time: string; event: CalendarEvent }
  | { type: "task"; time: string; task: Task };

/** Agenda cronológica del día: mezcla eventos y tareas, diferenciándolos visualmente. */
export function AgendaCard({ events, tasks }: { events: CalendarEvent[]; tasks: Task[] }) {
  const items: AgendaItem[] = [
    ...events.filter((e) => e.startTime).map((e) => ({ type: "event" as const, time: e.startTime!, event: e })),
    ...tasks.filter((t) => t.time).map((t) => ({ type: "task" as const, time: t.time!, task: t })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Panel title="Agenda de hoy">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nada programado para hoy.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.type === "event" ? item.event.id : item.task.id} className="flex gap-4 rounded-xl p-2 hover:bg-white/[0.03]">
              <span className="w-12 shrink-0 pt-0.5 text-sm tabular-nums text-muted-foreground">{item.time}</span>
              {item.type === "event" ? <EventRow event={item.event} /> : <TaskRow task={item.task} />}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <div className="min-w-0 flex-1 border-l-2 border-primary pl-3">
      <p className="font-medium">{event.title}</p>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {event.endTime && <span>hasta las {event.endTime}</span>}
        {event.location && (
          <>
            <MapPin className="ml-1 size-3" />
            {event.location}
          </>
        )}
      </p>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const done = task.status === "completed";
  const Icon = done ? CircleCheck : Circle;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 pl-3.5">
      <Icon className={cn("size-4 shrink-0", done ? "text-primary" : "text-muted-foreground")} />
      <p className={cn("truncate", done && "text-muted-foreground line-through")}>{task.title}</p>
      <span className="ml-auto text-xs text-muted-foreground">Tarea</span>
    </div>
  );
}
