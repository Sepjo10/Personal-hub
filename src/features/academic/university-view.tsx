import { Panel } from "@/components/common/panel";
import { Pill } from "@/components/common/pill";
import { ProgressBar } from "@/components/common/progress-bar";
import { relativeDayLabel, WEEKDAYS_SHORT, daysBetween } from "@/lib/dates";
import { getToday } from "@/lib/today";
import { getMockAcademicDates, mockSchedule, mockSubjects } from "@/data/mock/academic";

/** Universidad: asignaturas con progreso, horario semanal y próximas fechas. */
export async function UniversityView() {
  const today = await getToday();
  const subjectById = new Map(mockSubjects.map((s) => [s.id, s]));
  const dates = getMockAcademicDates(today).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Panel title="Asignaturas">
          <div className="grid gap-3 sm:grid-cols-2">
            {mockSubjects.map((s) => (
              <div key={s.id} className="rounded-xl bg-white/[0.03] p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{s.name}</p>
                  <Pill className="bg-primary/15 text-primary">{s.code}</Pill>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{s.professor}</p>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Progreso</span>
                  <span>{s.progress}%</span>
                </div>
                <ProgressBar value={s.progress} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Horario semanal">
          <ul className="divide-y divide-white/5">
            {mockSchedule.map((c) => (
              <li key={c.id} className="flex items-center gap-4 py-2.5 text-sm">
                <span className="w-10 text-muted-foreground">{WEEKDAYS_SHORT[c.weekday]}</span>
                <span className="w-24 tabular-nums text-muted-foreground">{c.start}–{c.end}</span>
                <span className="flex-1 truncate">{subjectById.get(c.subjectId)?.name}</span>
                <span className="text-xs text-muted-foreground">{c.room}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Exámenes y entregas">
        <ul className="space-y-3">
          {dates.map((d) => (
            <li key={d.id} className="rounded-xl bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{d.title}</p>
                <Pill className={d.kind === "exam" ? "bg-rose-400/15 text-rose-300" : "bg-amber-400/15 text-amber-300"}>
                  {d.kind === "exam" ? "Examen" : "Entrega"}
                </Pill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {subjectById.get(d.subjectId)?.name} · <span className="capitalize">{relativeDayLabel(d.date, today)}</span> (en {daysBetween(today, d.date)} días)
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
