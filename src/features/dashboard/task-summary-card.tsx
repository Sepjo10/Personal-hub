import Link from "next/link";
import { Panel } from "@/components/common/panel";
import type { Task } from "@/types/planner";

/** Resumen de tareas del día: completadas vs. total, con barra de progreso. */
export function TaskSummaryCard({ tasks }: { tasks: Task[] }) {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.length - completed;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <Panel
      title="Tareas de hoy"
      action={
        <Link href="/planificador/hoy" className="text-xs text-primary hover:underline">
          Ver todas
        </Link>
      }
    >
      <div className="flex items-end justify-between">
        <p className="text-3xl font-semibold tabular-nums">
          {completed}
          <span className="text-lg text-muted-foreground">/{tasks.length}</span>
        </p>
        <p className="text-sm text-muted-foreground">{pending} pendientes</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
    </Panel>
  );
}
