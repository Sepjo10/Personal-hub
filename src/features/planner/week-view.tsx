import { addDays, formatDate, startOfWeek, WEEKDAYS_SHORT } from "@/lib/dates";
import { getToday } from "@/lib/today";
import { cn } from "@/lib/utils";
import { getMockEvents, getMockTasks } from "@/data/mock/planner";
import { itemsForDate } from "./day-items";
import { DateNav } from "./date-nav";

/** Vista Semana: 7 columnas (lunes a domingo) con eventos y tareas. */
export async function WeekView() {
  const today = await getToday();
  const monday = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const tasks = getMockTasks(today);
  const events = getMockEvents(today);

  const label = `${formatDate(days[0], { day: "numeric", month: "short" })} – ${formatDate(days[6], { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <>
      <DateNav label={label} />
      <div className="grid gap-3 md:grid-cols-7">
        {days.map((day, i) => {
          const items = itemsForDate(day, tasks, events);
          const isToday = day === today;
          return (
            <section key={day} className={cn("glass min-h-32 rounded-2xl p-3", isToday && "ring-1 ring-primary/60")}>
              <p className={cn("mb-2 text-xs font-medium", isToday ? "text-primary" : "text-muted-foreground")}>
                {WEEKDAYS_SHORT[i]} <span className="text-base text-foreground">{formatDate(day, { day: "numeric" })}</span>
              </p>
              <ul className="space-y-1.5 text-xs">
                {items.events.map((e) => (
                  <li key={e.id} className="rounded-md border-l-2 border-primary bg-primary/10 px-2 py-1">
                    {e.startTime && <span className="text-muted-foreground">{e.startTime} </span>}
                    {e.title}
                  </li>
                ))}
                {items.tasks.map((t) => (
                  <li key={t.id} className={cn("rounded-md bg-white/5 px-2 py-1", t.status === "completed" && "text-muted-foreground line-through")}>
                    ○ {t.title}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
