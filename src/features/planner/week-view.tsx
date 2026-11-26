import { addDays, formatDate, startOfWeek, WEEKDAYS_SHORT } from "@/lib/dates";
import { getToday } from "@/lib/today";
import { cn } from "@/lib/utils";
import { AddTaskButton } from "./add-task-button";
import { getTasksInRange } from "./data";
import { getCalendarEvents } from "./events";
import { itemsForDate } from "./day-items";
import { DateNav } from "./date-nav";
import { EventsNote } from "./events-note";
import { getBaseDate, type SearchParams } from "./search-params";
import { TaskChip } from "./task-chip";

const PATH = "/planificador/semana";

/** Vista Semana: 7 columnas (lunes a domingo) con eventos y tareas. Navegable con ?fecha=. */
export async function WeekView({ searchParams }: { searchParams: SearchParams }) {
  const today = await getToday();
  const monday = startOfWeek(await getBaseDate(searchParams, today));
  const isCurrentWeek = monday === startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const [tasks, events] = await Promise.all([getTasksInRange(days[0], days[6]), getCalendarEvents(days[0], days[6])]);

  const label = `${formatDate(days[0], { day: "numeric", month: "short" })} – ${formatDate(days[6], { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <>
      <DateNav
        label={label}
        prevHref={`${PATH}?fecha=${addDays(monday, -7)}`}
        nextHref={`${PATH}?fecha=${addDays(monday, 7)}`}
        todayHref={isCurrentWeek ? undefined : PATH}
      />
      <div className="grid gap-3 md:grid-cols-7">
        {days.map((day, i) => {
          const items = itemsForDate(day, tasks, events);
          const isToday = day === today;
          return (
            <section key={day} className={cn("glass group min-h-32 rounded-2xl p-3", isToday && "ring-1 ring-primary/60")}>
              <div className="mb-2 flex items-center justify-between">
                <p className={cn("text-xs font-medium", isToday ? "text-primary" : "text-muted-foreground")}>
                  {WEEKDAYS_SHORT[i]} <span className="text-base text-foreground">{formatDate(day, { day: "numeric" })}</span>
                </p>
                <AddTaskButton dueDate={day} label="" className="md:opacity-0 md:group-hover:opacity-100" />
              </div>
              <ul className="space-y-1.5 text-xs">
                {items.events.map((e) => (
                  <li
                    key={e.id}
                    className={cn(
                      "rounded-md border-l-2 px-2 py-1",
                      e.kind === "google" ? "border-emerald-400 bg-emerald-400/10" : "border-primary bg-primary/10",
                    )}
                  >
                    {e.startTime && <span className="text-muted-foreground">{e.startTime} </span>}
                    {e.title}
                  </li>
                ))}
                {items.tasks.map((t) => (
                  <li key={t.id}>
                    <TaskChip task={t} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <EventsNote />
    </>
  );
}
