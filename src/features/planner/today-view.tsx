import { Panel } from "@/components/common/panel";
import { PhaseNote } from "@/components/common/phase-note";
import { addDays, formatLongDate } from "@/lib/dates";
import { getToday } from "@/lib/today";
import { getMockEvents, getMockTasks } from "@/data/mock/planner";
import { AgendaCard } from "@/features/dashboard/agenda-card";
import { byPriority } from "@/features/dashboard/priority";
import { itemsForDate } from "./day-items";
import { TaskList } from "./task-list";

/** Vista Hoy: tareas pendientes/completadas, agenda y planificación de mañana. */
export async function TodayView() {
  const today = await getToday();
  const tomorrow = addDays(today, 1);
  const tasks = getMockTasks(today);
  const events = getMockEvents(today);

  const { tasks: todayTasks, events: todayEvents } = itemsForDate(today, tasks, events);
  const pending = todayTasks.filter((t) => t.status === "pending").sort(byPriority);
  const completed = todayTasks.filter((t) => t.status === "completed");
  const tomorrowTasks = itemsForDate(tomorrow, tasks, events).tasks;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Panel title={`Pendientes · ${formatLongDate(today)}`}>
          <TaskList tasks={pending} empty="No hay tareas pendientes." />
          <PhaseNote>Crear, editar y completar tareas llegará en la Fase 3.</PhaseNote>
        </Panel>
        <Panel title={`Completadas (${completed.length})`}>
          <TaskList tasks={completed} empty="Aún no has completado ninguna tarea." />
        </Panel>
      </div>
      <div className="space-y-4">
        <AgendaCard events={todayEvents} tasks={todayTasks} />
        <Panel title="Mañana">
          <TaskList tasks={tomorrowTasks} empty="Nada planificado para mañana." />
        </Panel>
      </div>
    </div>
  );
}
