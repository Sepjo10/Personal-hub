import type { Task } from "@/types/planner";
import { TaskItem } from "./task-item";

/** Lista de tareas. Cada elemento es interactivo (completar / editar). */
export function TaskList({ tasks, empty }: { tasks: Task[]; empty: string }) {
  if (tasks.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;

  return (
    <ul className="divide-y divide-white/5">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
