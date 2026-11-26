"use client";

import { useActionState, useState } from "react";
import { ArrowRight, CalendarClock, ExternalLink, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/common/date-picker";
import { FormActions } from "@/components/common/form-actions";
import { Modal, fieldClass, labelClass } from "@/components/common/modal";
import { Pill } from "@/components/common/pill";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ApplicationStatus, JobApplication } from "@/types/academic";
import { deleteApplication, saveApplication, type CareerActionResult } from "./career-actions";

export const statusStyles: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-white/10 text-muted-foreground" },
  sent: { label: "Enviada", className: "bg-sky-400/15 text-sky-300" },
  interview: { label: "Entrevista", className: "bg-primary/15 text-primary" },
  accepted: { label: "Aceptada", className: "bg-emerald-400/15 text-emerald-300" },
  rejected: { label: "Rechazada", className: "bg-rose-400/15 text-rose-300" },
};
const STATUSES = Object.keys(statusStyles) as ApplicationStatus[];

type Editing = { mode: "new" } | { mode: "edit"; application: JobApplication } | null;

/** Candidaturas (cliente): contadores por estado (que filtran), lista y modal. */
export function CareerBoard({ applications, today }: { applications: JobApplication[]; today: string }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [filter, setFilter] = useState<ApplicationStatus | null>(null);
  const visible = filter ? applications.filter((a) => a.status === filter) : applications;
  const close = () => setEditing(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter((f) => (f === status ? null : status))}
            className={cn("glass rounded-2xl p-4 text-left transition-colors", filter === status && "ring-1 ring-primary")}
          >
            <p className="text-2xl font-semibold tabular-nums">{applications.filter((a) => a.status === status).length}</p>
            <p className="text-xs text-muted-foreground">{statusStyles[status].label}</p>
          </button>
        ))}
      </div>

      <section className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Candidaturas{filter && ` · ${statusStyles[filter].label}`}
          </h2>
          <Button size="sm" onClick={() => setEditing({ mode: "new" })}>
            <Plus />
            Nueva candidatura
          </Button>
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {applications.length === 0 ? "Aún no has registrado ninguna candidatura." : "No hay candidaturas en este estado."}
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {visible.map((a) => {
              const nextInterview = a.interviews.find((d) => d >= today);
              return (
                <li key={a.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => setEditing({ mode: "edit", application: a })} className="min-w-0 flex-1 text-left">
                    <p className="font-medium hover:text-primary">{a.company}</p>
                    <p className="text-sm text-muted-foreground">{a.position}</p>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {a.appliedOn && <span>Solicitada el {formatDate(a.appliedOn, { day: "numeric", month: "short", year: "numeric" })}</span>}
                      {a.interviews.length > 0 && (
                        <span className={cn("inline-flex items-center gap-1", nextInterview && "text-primary")}>
                          <CalendarClock className="size-3" />
                          {nextInterview
                            ? `Próxima entrevista: ${formatDate(nextInterview, { weekday: "short", day: "numeric", month: "short" })}`
                            : `${a.interviews.length} entrevista${a.interviews.length > 1 ? "s" : ""}`}
                        </span>
                      )}
                      {a.nextStep && (
                        <span className="inline-flex items-center gap-1 text-foreground/80">
                          <ArrowRight className="size-3" />
                          {a.nextStep}
                        </span>
                      )}
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noopener noreferrer" aria-label="Ver oferta" className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-primary">
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                    <Pill className={statusStyles[a.status].className}>{statusStyles[a.status].label}</Pill>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Modal open={editing !== null} onClose={close} title={editing?.mode === "edit" ? "Editar candidatura" : "Nueva candidatura"}>
        {editing && (
          <ApplicationForm
            key={editing.mode === "edit" ? editing.application.id : "new"}
            application={editing.mode === "edit" ? editing.application : undefined}
            today={today}
            onDone={close}
          />
        )}
      </Modal>
    </div>
  );
}

function ApplicationForm({ application, today, onDone }: { application?: JobApplication; today: string; onDone: () => void }) {
  // Lista dinámica de entrevistas: cada una con una clave estable para React
  const [interviews, setInterviews] = useState(() =>
    (application?.interviews ?? []).map((date, i) => ({ key: i, date })),
  );
  const [nextKey, setNextKey] = useState(interviews.length);
  const [result, action, pending] = useActionState<CareerActionResult, FormData>(async (_prev, fd) => {
    const res = await saveApplication(application?.id ?? null, fd);
    if (res.ok) onDone();
    return res;
  }, { ok: true });

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="j-company" className={labelClass}>Empresa</label>
          <input id="j-company" name="company" required maxLength={120} defaultValue={application?.company} autoFocus className={fieldClass} />
        </div>
        <div>
          <label htmlFor="j-status" className={labelClass}>Estado</label>
          <select id="j-status" name="status" defaultValue={application?.status ?? "pending"} className={fieldClass}>
            {STATUSES.map((s) => <option key={s} value={s}>{statusStyles[s].label}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label htmlFor="j-position" className={labelClass}>Puesto u oferta</label>
          <input id="j-position" name="position" required maxLength={150} defaultValue={application?.position} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="j-applied" className={labelClass}>Fecha de solicitud</label>
          <DatePicker id="j-applied" name="appliedOn" defaultValue={application?.appliedOn} allowEmpty />
        </div>
        <div>
          <label htmlFor="j-url" className={labelClass}>Enlace a la oferta</label>
          <input id="j-url" name="url" type="url" placeholder="https://" defaultValue={application?.url} className={fieldClass} />
        </div>

        <div className="col-span-2">
          <span className={labelClass}>Entrevistas</span>
          <div className="space-y-2">
            {interviews.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <div className="flex-1">
                  <DatePicker name="interviews" defaultValue={item.date} />
                </div>
                <button
                  type="button"
                  aria-label="Quitar entrevista"
                  onClick={() => setInterviews((list) => list.filter((i) => i.key !== item.key))}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setInterviews((list) => [...list, { key: nextKey, date: today }]);
                setNextKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="size-3.5" />
              Añadir entrevista
            </button>
          </div>
        </div>

        <div className="col-span-2">
          <label htmlFor="j-next" className={labelClass}>Próximos pasos</label>
          <input id="j-next" name="nextStep" maxLength={200} defaultValue={application?.nextStep} placeholder="Preparar entrevista técnica…" className={fieldClass} />
        </div>
        <div className="col-span-2">
          <label htmlFor="j-notes" className={labelClass}>Notas</label>
          <textarea id="j-notes" name="notes" rows={3} maxLength={5000} defaultValue={application?.notes} className={`${fieldClass} h-auto py-2`} />
        </div>
      </div>

      {!result.ok && result.error && <p role="alert" className="text-sm text-destructive">{result.error}</p>}
      <FormActions
        pending={pending}
        onCancel={onDone}
        onDone={onDone}
        onDelete={application ? () => deleteApplication(application.id) : undefined}
      />
    </form>
  );
}
