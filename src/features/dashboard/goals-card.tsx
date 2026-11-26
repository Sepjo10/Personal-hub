"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { FormActions } from "@/components/common/form-actions";
import { Modal, fieldClass, labelClass } from "@/components/common/modal";
import { Panel } from "@/components/common/panel";
import { cn } from "@/lib/utils";
import type { DailyGoal } from "@/types/planner";
import { deleteGoal, saveGoal, setGoalProgress, type GoalActionResult } from "./goals-actions";

type Editing = { mode: "new" } | { mode: "edit"; goal: DailyGoal } | null;

const fmt = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 2 });

/**
 * Objetivos diarios (cliente). El progreso es de HOY: cada día empieza en 0.
 * useOptimistic mueve la barra al instante y el servidor confirma después.
 */
export function GoalsCard({ goals }: { goals: DailyGoal[] }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [optimistic, setOptimistic] = useOptimistic(goals, (state, change: { id: string; value: number }) =>
    state.map((g) => (g.id === change.id ? { ...g, current: change.value } : g)),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function change(goal: DailyGoal, delta: number) {
    const value = Math.max(0, Math.round((goal.current + delta) * 100) / 100);
    if (value === goal.current) return;
    startTransition(async () => {
      setOptimistic({ id: goal.id, value });
      const res = await setGoalProgress(goal.id, value);
      setError(res.ok ? undefined : res.error);
    });
  }

  return (
    <Panel
      title="Objetivos diarios"
      action={
        <button
          type="button"
          onClick={() => setEditing({ mode: "new" })}
          aria-label="Nuevo objetivo"
          className="rounded-lg p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      }
    >
      {optimistic.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no tienes objetivos. Crea uno con el botón +, por ejemplo «Estudio, 4 h».
        </p>
      ) : (
        <ul className="space-y-4">
          {optimistic.map((goal) => {
            const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <li key={goal.id}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <button type="button" onClick={() => setEditing({ mode: "edit", goal })} className="truncate text-left hover:text-primary">
                    {goal.label}
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <StepButton label={`Restar a ${goal.label}`} onClick={() => change(goal, -goal.step)} disabled={goal.current === 0}>
                      <Minus className="size-3.5" />
                    </StepButton>
                    <span className="min-w-16 text-center tabular-nums text-muted-foreground">
                      {fmt(goal.current)}/{fmt(goal.target)} {goal.unit}
                    </span>
                    <StepButton label={`Sumar a ${goal.label}`} onClick={() => change(goal, goal.step)}>
                      <Plus className="size-3.5" />
                    </StepButton>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn("h-full rounded-full transition-all", percent === 100 ? "bg-emerald-400" : "bg-primary")}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.mode === "edit" ? "Editar objetivo" : "Nuevo objetivo"}>
        {editing && (
          <GoalForm
            key={editing.mode === "edit" ? editing.goal.id : "new"}
            goal={editing.mode === "edit" ? editing.goal : undefined}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </Panel>
  );
}

function StepButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-md bg-white/5 p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function GoalForm({ goal, onDone }: { goal?: DailyGoal; onDone: () => void }) {
  const [result, formAction, pending] = useActionState<GoalActionResult, FormData>(async (_prev, formData) => {
    const res = await saveGoal(goal?.id ?? null, formData);
    if (res.ok) onDone();
    return res;
  }, { ok: true });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="goal-label" className={labelClass}>Nombre</label>
        <input id="goal-label" name="label" required maxLength={40} defaultValue={goal?.label} placeholder="Estudio" autoFocus className={fieldClass} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="goal-target" className={labelClass}>Meta diaria</label>
          <input id="goal-target" name="target" required inputMode="decimal" defaultValue={goal ? fmt(goal.target) : ""} placeholder="4" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="goal-unit" className={labelClass}>Unidad</label>
          <input id="goal-unit" name="unit" maxLength={15} defaultValue={goal?.unit} placeholder="h" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="goal-step" className={labelClass}>Incremento</label>
          <input id="goal-step" name="step" inputMode="decimal" defaultValue={goal ? fmt(goal.step) : "1"} className={fieldClass} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">El incremento es lo que suma o resta cada pulsación de + y −. El progreso vuelve a 0 cada día.</p>

      {!result.ok && result.error && <p role="alert" className="text-sm text-destructive">{result.error}</p>}

      <FormActions pending={pending} onCancel={onDone} onDelete={goal ? () => deleteGoal(goal.id) : undefined} onDone={onDone} />
    </form>
  );
}
