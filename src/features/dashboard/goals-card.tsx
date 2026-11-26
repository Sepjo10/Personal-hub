import { Panel } from "@/components/common/panel";
import type { DailyGoal } from "@/types/planner";

/** Progreso de los objetivos diarios. */
export function GoalsCard({ goals }: { goals: DailyGoal[] }) {
  return (
    <Panel title="Objetivos diarios">
      <ul className="space-y-4">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <li key={goal.id}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span>{goal.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {goal.current}/{goal.target} {goal.unit}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={percent === 100 ? "h-full rounded-full bg-emerald-400" : "h-full rounded-full bg-primary"}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
