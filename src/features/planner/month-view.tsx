import { formatDate, monthGridDays, WEEKDAYS_SHORT } from "@/lib/dates";
import { getToday } from "@/lib/today";
import { cn } from "@/lib/utils";
import { getMockEvents, getMockTasks } from "@/data/mock/planner";
import type { EventKind } from "@/types/planner";
import { itemsForDate } from "./day-items";
import { DateNav } from "./date-nav";

const kindColor: Record<EventKind, string> = {
  exam: "bg-rose-400",
  deadline: "bg-amber-400",
  class: "bg-sky-400",
  personal: "bg-primary",
};

/** Vista Mes: cuadrícula de 6 semanas. En móvil muestra puntos; en escritorio, títulos. */
export async function MonthView() {
  const today = await getToday();
  const days = monthGridDays(today);
  const month = today.slice(0, 7);
  const tasks = getMockTasks(today);
  const events = getMockEvents(today);

  return (
    <>
      <DateNav label={formatDate(today, { month: "long", year: "numeric" })} />
      <div className="glass overflow-hidden rounded-2xl">
        <div className="grid grid-cols-7 border-b border-white/5 text-center text-xs text-muted-foreground">
          {WEEKDAYS_SHORT.map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const { events: dayEvents, tasks: dayTasks } = itemsForDate(day, tasks, events);
            const inMonth = day.startsWith(month);
            const isToday = day === today;
            const labels = [...dayEvents.map((e) => ({ id: e.id, title: e.title, color: kindColor[e.kind] })), ...dayTasks.map((t) => ({ id: t.id, title: t.title, color: "bg-white/40" }))];
            return (
              <div key={day} className={cn("min-h-16 border-b border-r border-white/5 p-1.5 md:min-h-24", !inMonth && "opacity-35")}>
                <span className={cn("grid size-6 place-items-center rounded-full text-xs", isToday && "bg-primary font-semibold text-primary-foreground")}>
                  {Number(day.slice(8))}
                </span>
                {/* Móvil: puntos */}
                <div className="mt-1 flex flex-wrap gap-0.5 md:hidden">
                  {labels.map((l) => (
                    <span key={l.id} className={cn("size-1.5 rounded-full", l.color)} />
                  ))}
                </div>
                {/* Escritorio: títulos (máx. 2) */}
                <ul className="mt-1 hidden space-y-0.5 md:block">
                  {labels.slice(0, 2).map((l) => (
                    <li key={l.id} className="flex items-center gap-1 truncate text-[11px]">
                      <span className={cn("size-1.5 shrink-0 rounded-full", l.color)} />
                      <span className="truncate">{l.title}</span>
                    </li>
                  ))}
                  {labels.length > 2 && <li className="text-[11px] text-muted-foreground">+{labels.length - 2} más</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend color="bg-rose-400" label="Examen" />
        <Legend color="bg-amber-400" label="Entrega" />
        <Legend color="bg-sky-400" label="Clase" />
        <Legend color="bg-primary" label="Personal" />
        <Legend color="bg-white/40" label="Tarea" />
      </div>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", color)} />
      {label}
    </span>
  );
}
