import { Panel } from "@/components/common/panel";
import type { Task } from "@/types/planner";
import { byPriority, priorityStyles } from "./priority";

/** Las 3 tareas pendientes más prioritarias del día. */
export function PrioritiesCard({ tasks }: { tasks: Task[] }) {
  const top = tasks.filter((t) => t.status === "pending").sort(byPriority).slice(0, 3);

  return (
    <Panel title="Prioridades del día">
      {top.length === 0 ? (
        <p className="text-sm text-muted-foreground">No quedan tareas pendientes. ¡Buen trabajo!</p>
      ) : (
        <ol className="space-y-3">
          {top.map((task, i) => (
            <li key={task.id} className="flex items-center gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.category}</p>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-xs ${priorityStyles[task.priority].badge}`}>
                {priorityStyles[task.priority].label}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
