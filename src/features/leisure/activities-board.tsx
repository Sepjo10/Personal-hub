"use client";

import { useActionState, useState, useTransition } from "react";
import {
  CalendarDays,
  Clapperboard,
  ExternalLink,
  Luggage,
  MapPin,
  Music,
  Plane,
  Plus,
  Stethoscope,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/common/date-picker";
import { Modal, fieldClass, labelClass } from "@/components/common/modal";
import { TimeField } from "@/components/common/time-field";
import { formatDate, relativeDayLabel } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import type { Activity, ActivityType } from "@/types/leisure";
import { deleteActivity, saveActivity, type ActivityActionResult } from "./activities-actions";

const typeInfo: Record<ActivityType, { label: string; icon: LucideIcon }> = {
  event: { label: "Evento", icon: Ticket },
  flight: { label: "Vuelo", icon: Plane },
  trip: { label: "Viaje", icon: Luggage },
  cinema: { label: "Cine", icon: Clapperboard },
  concert: { label: "Concierto", icon: Music },
  medical: { label: "Cita médica", icon: Stethoscope },
};

type Editing = { mode: "new" } | { mode: "edit"; activity: Activity } | null;

/** Actividades (cliente): próximas, pasadas y modal de crear/editar. */
export function ActivitiesBoard({ activities, today }: { activities: Activity[]; today: string }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [showPast, setShowPast] = useState(false);
  const upcoming = activities.filter((a) => !a.date || a.date >= today);
  const past = activities.filter((a) => a.date && a.date < today).reverse();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setEditing({ mode: "new" })}>
          <Plus />
          Nueva actividad
        </Button>
      </div>

      {upcoming.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-muted-foreground">No tienes actividades próximas.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {upcoming.map((a) => (
            <ActivityCard key={a.id} activity={a} today={today} onEdit={() => setEditing({ mode: "edit", activity: a })} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowPast((s) => !s)} className="mb-3 text-sm text-muted-foreground hover:text-foreground">
            {showPast ? "Ocultar" : "Ver"} actividades pasadas ({past.length})
          </button>
          {showPast && (
            <div className="grid gap-4 opacity-70 sm:grid-cols-2 xl:grid-cols-3">
              {past.map((a) => (
                <ActivityCard key={a.id} activity={a} today={today} onEdit={() => setEditing({ mode: "edit", activity: a })} />
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.mode === "edit" ? "Editar actividad" : "Nueva actividad"}>
        {editing && (
          <ActivityForm
            key={editing.mode === "edit" ? editing.activity.id : "new"}
            activity={editing.mode === "edit" ? editing.activity : undefined}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function ActivityCard({ activity: a, today, onEdit }: { activity: Activity; today: string; onEdit: () => void }) {
  const { label, icon: Icon } = typeInfo[a.type];
  return (
    <article className="glass rounded-2xl p-5">
      <button type="button" onClick={onEdit} className="mb-3 flex w-full items-center gap-3 text-left">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium hover:text-primary">{a.title}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </button>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" />
          {a.date ? (
            <span>
              <span className="capitalize">{relativeDayLabel(a.date, today)}</span> · {formatDate(a.date, { day: "numeric", month: "short", year: "numeric" })}
              {a.time && ` · ${a.time}`}
            </span>
          ) : (
            "Sin fecha"
          )}
        </li>
        {a.location && (
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{a.location}</span>
          </li>
        )}
        {a.people && a.people.length > 0 && (
          <li className="flex items-center gap-2">
            <Users className="size-4 shrink-0" />
            <span className="truncate">{a.people.join(", ")}</span>
          </li>
        )}
        {a.links?.map((link) => (
          <li key={link}>
            <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
              <ExternalLink className="size-4 shrink-0" />
              <span className="truncate">{link.replace(/^https?:\/\//, "")}</span>
            </a>
          </li>
        ))}
      </ul>
      {(a.price !== undefined || a.notes) && (
        <div className="mt-3 flex items-end justify-between gap-2 border-t border-white/5 pt-3 text-sm">
          <span className="line-clamp-2 text-xs text-muted-foreground">{a.notes}</span>
          {a.price !== undefined && <span className="shrink-0 font-medium tabular-nums">{formatCurrency(a.price)}</span>}
        </div>
      )}
    </article>
  );
}

function ActivityForm({ activity, onDone }: { activity?: Activity; onDone: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [result, formAction, pending] = useActionState<ActivityActionResult, FormData>(async (_prev, formData) => {
    const res = await saveActivity(activity?.id ?? null, formData);
    if (res.ok) onDone();
    return res;
  }, { ok: true });

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="a-title" className={labelClass}>Título</label>
          <input id="a-title" name="title" required maxLength={150} defaultValue={activity?.title} autoFocus className={fieldClass} />
        </div>
        <div>
          <label htmlFor="a-type" className={labelClass}>Tipo</label>
          <select id="a-type" name="type" defaultValue={activity?.type ?? "event"} className={fieldClass}>
            {(Object.keys(typeInfo) as ActivityType[]).map((t) => (
              <option key={t} value={t}>{typeInfo[t].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="a-price" className={labelClass}>Precio (€, opcional)</label>
          <input
            id="a-price"
            name="price"
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={activity?.price !== undefined ? String(activity.price).replace(".", ",") : undefined}
            className={`${fieldClass} tabular-nums`}
          />
        </div>
        <div>
          <label htmlFor="a-date" className={labelClass}>Fecha</label>
          <DatePicker id="a-date" name="date" defaultValue={activity?.date} allowEmpty />
        </div>
        <div>
          <label htmlFor="a-time" className={labelClass}>Hora</label>
          <TimeField id="a-time" name="time" defaultValue={activity?.time} />
        </div>
        <div className="col-span-2">
          <label htmlFor="a-location" className={labelClass}>Dirección o lugar</label>
          <input id="a-location" name="location" maxLength={200} defaultValue={activity?.location} className={fieldClass} />
        </div>
        <div className="col-span-2">
          <label htmlFor="a-people" className={labelClass}>Personas (separadas por comas)</label>
          <input id="a-people" name="people" defaultValue={activity?.people?.join(", ")} className={fieldClass} />
        </div>
        <div className="col-span-2">
          <label htmlFor="a-links" className={labelClass}>Enlaces y documentos (uno por línea)</label>
          <textarea
            id="a-links"
            name="links"
            rows={2}
            placeholder="https://… (entradas, reserva, PDF en Drive…)"
            defaultValue={activity?.links?.join("\n")}
            className={`${fieldClass} h-auto py-2`}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="a-notes" className={labelClass}>Notas</label>
          <textarea id="a-notes" name="notes" rows={2} maxLength={5000} defaultValue={activity?.notes} className={`${fieldClass} h-auto py-2`} />
        </div>
      </div>

      {!result.ok && result.error && <p role="alert" className="text-sm text-destructive">{result.error}</p>}

      <div className="flex items-center justify-between gap-2 pt-2">
        {activity ? (
          confirmDelete ? (
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => startDelete(async () => { if ((await deleteActivity(activity.id)).ok) onDone(); })}
            >
              {deleting ? "Eliminando…" : "¿Seguro? Eliminar"}
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)} className="text-muted-foreground">Eliminar</Button>
          )
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
          <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</Button>
        </div>
      </div>
    </form>
  );
}
