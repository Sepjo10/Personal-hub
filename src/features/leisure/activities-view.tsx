import { CalendarDays, Clapperboard, Luggage, MapPin, Music, Plane, Stethoscope, Ticket, Users, type LucideIcon } from "lucide-react";
import { formatDate, relativeDayLabel } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { getToday } from "@/lib/today";
import { getMockActivities } from "@/data/mock/leisure";
import type { ActivityType } from "@/types/leisure";

const typeInfo: Record<ActivityType, { label: string; icon: LucideIcon }> = {
  flight: { label: "Vuelo", icon: Plane },
  trip: { label: "Viaje", icon: Luggage },
  cinema: { label: "Cine", icon: Clapperboard },
  concert: { label: "Concierto", icon: Music },
  medical: { label: "Cita médica", icon: Stethoscope },
  event: { label: "Evento", icon: Ticket },
};

/** Actividades: tarjetas ordenadas por fecha con los datos opcionales que tenga cada una. */
export async function ActivitiesView() {
  const today = await getToday();
  const activities = getMockActivities(today).sort((a, b) => (a.date ?? "9").localeCompare(b.date ?? "9"));

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {activities.map((a) => {
        const { label, icon: Icon } = typeInfo[a.type];
        return (
          <article key={a.id} className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {a.date && (
                <li className="flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  <span className="capitalize">{relativeDayLabel(a.date, today)}</span>· {formatDate(a.date, { day: "numeric", month: "short" })}
                  {a.time && ` · ${a.time}`}
                </li>
              )}
              {a.location && (
                <li className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {a.location}
                </li>
              )}
              {a.people && (
                <li className="flex items-center gap-2">
                  <Users className="size-4" />
                  {a.people.join(", ")}
                </li>
              )}
            </ul>
            {(a.price !== undefined || a.notes) && (
              <div className="mt-3 flex items-end justify-between gap-2 border-t border-white/5 pt-3 text-sm">
                <span className="text-xs text-muted-foreground">{a.notes}</span>
                {a.price !== undefined && <span className="font-medium tabular-nums">{formatCurrency(a.price)}</span>}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
