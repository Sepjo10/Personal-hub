import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight } from "lucide-react";
import { addDays, formatLongDate, greeting, todayISO } from "@/lib/dates";
import { getTasksInRange } from "@/features/planner/data";
import { EventsNote } from "@/features/planner/events-note";
import { getMockGoals } from "@/data/mock/planner";
import { getCalendarEvents } from "@/features/planner/events";
import { AgendaCard } from "./agenda-card";
import { GoalsCard } from "./goals-card";
import { PrioritiesCard } from "./priorities-card";
import { TaskSummaryCard } from "./task-summary-card";
import { UpcomingEventsCard } from "./upcoming-events-card";

/**
 * Dashboard de Inicio. Componente de servidor asíncrono.
 * connection() indica a Next.js que esta parte depende del momento de la
 * petición (la fecha de hoy), así que se calcula en cada visita y no se
 * congela al compilar. Por eso la página lo envuelve en <Suspense>.
 */
export async function Dashboard() {
  await connection();
  const now = new Date();
  const today = todayISO(now);

  // Tareas y eventos reales (próximos 30 días); los objetivos diarios siguen siendo de ejemplo.
  const [todayTasks, events] = await Promise.all([getTasksInRange(today, today), getCalendarEvents(today, addDays(today, 30))]);
  const goals = getMockGoals();

  const todayEvents = events.filter((e) => e.date === today);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm capitalize text-muted-foreground">{formatLongDate(today)}</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{greeting(now)}</h1>
        </div>
        <Link
          href="/planificador/hoy"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Planificar mañana <ArrowRight className="size-4" />
        </Link>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PrioritiesCard tasks={todayTasks} />
          <AgendaCard events={todayEvents} tasks={todayTasks} />
          <EventsNote />
        </div>
        <div className="space-y-4">
          <TaskSummaryCard tasks={todayTasks} />
          <UpcomingEventsCard events={events} today={today} />
          <GoalsCard goals={goals} />
        </div>
      </div>
    </div>
  );
}

/** Esqueleto que se muestra mientras se calcula el dashboard. */
export function DashboardSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 lg:grid-cols-3">
      <div className="h-64 rounded-2xl bg-white/5 lg:col-span-2" />
      <div className="h-64 rounded-2xl bg-white/5" />
    </div>
  );
}
