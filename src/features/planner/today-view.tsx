import { Panel } from "@/components/common/panel";
import { addDays, formatLongDate } from "@/lib/dates";
import { getToday } from "@/lib/today";
import { getMockEvents } from "@/data/mock/planner";
import { AgendaCard } from "@/features/dashboard/agenda-card";
import { byPriority } from "@/features/dashboard/priority";
import { AddTaskButton } from "./add-task-button";
import { getTasksInRange } from "./data";
import { itemsForDate } from "./day-items";
import { EventsNote } from "./events-note";
import { TaskList } from "./task-list";

/** Vista Hoy: tareas pendientes/completadas, agenda y planificación de mañana. */
export async function TodayView() {
  const today = await getToday();
  const tomorrow = addDays(today, 1);
  const tasks = await getTasksInRange(today, tomorrow);
  const events = getMockEvents(today);

  const { tasks: todayTasks, events: todayEvents } = itemsForDate(today, tasks, events);
  const pending = todayTasks.filter((t) => t.status === "pending").sort(byPriority);
  const completed = todayTasks.filter((t) => t.status === "completed");
  const tomorrowTasks = itemsForDate(tomorrow, tasks, events).tasks;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Panel title={`Pendientes · ${formatLongDate(today)}`} action={<AddTaskButton dueDate={today} />}>
          <TaskList tasks={pending} empty="No hay tareas pendientes para hoy." />
        </Panel>
        <Panel title={`Completadas (${completed.length})`}>
          <TaskList tasks={completed} empty="Aún no has completado ninguna tarea." />
        </Panel>
      </div>
      <div className="space-y-4">
        <div>
          <AgendaCard events={todayEvents} tasks={todayTasks} />
          <EventsNote />
        </div>
        <Panel title="Mañana" action={<AddTaskButton dueDate={tomorrow} label="Planificar" />}>
          <TaskList tasks={tomorrowTasks} empty="Nada planificado para mañana." />
        </Panel>
      </div>
    </div>
  );
}
