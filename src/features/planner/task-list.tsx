import { Circle, CircleCheck, Clock } from "lucide-react";
import { Pill } from "@/components/common/pill";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/planner";
import { priorityStyles } from "@/features/dashboard/priority";

/** Lista de tareas con prioridad, categoría y hora. */
export function TaskList({ tasks, empty }: { tasks: Task[]; empty: string }) {
  if (tasks.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;

  return (
    <ul className="divide-y divide-white/5">
      {tasks.map((task) => {
        const done = task.status === "completed";
        const Icon = done ? CircleCheck : Circle;
        return (
          <li key={task.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Icon className={cn("size-5 shrink-0", done ? "text-primary" : "text-muted-foreground")} />
            <div className="min-w-0 flex-1">
              <p className={cn("truncate font-medium", done && "text-muted-foreground line-through")}>{task.title}</p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                {task.category}
                {task.time && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {task.time}
                  </span>
                )}
              </p>
            </div>
            {!done && <Pill className={priorityStyles[task.priority].badge}>{priorityStyles[task.priority].label}</Pill>}
          </li>
        );
      })}
    </ul>
  );
}
