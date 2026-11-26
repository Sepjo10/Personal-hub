import { CalendarClock, ArrowRight } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { Pill } from "@/components/common/pill";
import { formatDate } from "@/lib/dates";
import { getToday } from "@/lib/today";
import { getMockApplications } from "@/data/mock/academic";
import type { ApplicationStatus } from "@/types/academic";

export const statusStyles: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-white/10 text-muted-foreground" },
  sent: { label: "Enviada", className: "bg-sky-400/15 text-sky-300" },
  interview: { label: "Entrevista", className: "bg-primary/15 text-primary" },
  accepted: { label: "Aceptada", className: "bg-emerald-400/15 text-emerald-300" },
  rejected: { label: "Rechazada", className: "bg-rose-400/15 text-rose-300" },
};

/** Carrera: resumen por estado y listado de candidaturas. */
export async function CareerView() {
  const today = await getToday();
  const applications = getMockApplications(today);
  const statuses = Object.keys(statusStyles) as ApplicationStatus[];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statuses.map((status) => (
          <div key={status} className="glass rounded-2xl p-4">
            <p className="text-2xl font-semibold">{applications.filter((a) => a.status === status).length}</p>
            <p className="text-xs text-muted-foreground">{statusStyles[status].label}</p>
          </div>
        ))}
      </div>
      <Panel title="Candidaturas">
        <ul className="divide-y divide-white/5">
          {applications.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{a.company}</p>
                <p className="text-sm text-muted-foreground">{a.position}</p>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {a.appliedOn && <span>Enviada el {formatDate(a.appliedOn, { day: "numeric", month: "short" })}</span>}
                  {a.interviews.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="size-3" />
                      Entrevista: {a.interviews.map((d) => formatDate(d, { day: "numeric", month: "short" })).join(", ")}
                    </span>
                  )}
                  {a.nextStep && (
                    <span className="inline-flex items-center gap-1 text-foreground/80">
                      <ArrowRight className="size-3" />
                      {a.nextStep}
                    </span>
                  )}
                </p>
              </div>
              <Pill className={statusStyles[a.status].className}>{statusStyles[a.status].label}</Pill>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
