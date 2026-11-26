"use client";

import { useActionState, useState, useTransition } from "react";
import { Circle, CircleCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/common/date-picker";
import { FormActions } from "@/components/common/form-actions";
import { Modal, fieldClass, labelClass } from "@/components/common/modal";
import { Pill } from "@/components/common/pill";
import { ProgressBar } from "@/components/common/progress-bar";
import { TimeField } from "@/components/common/time-field";
import { daysBetween, formatDate, relativeDayLabel, WEEKDAYS_SHORT } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { AcademicDate, ClassSession, Subject } from "@/types/academic";
import {
  deleteAcademicDate,
  deleteSession,
  deleteSubject,
  saveAcademicDate,
  saveSession,
  saveSubject,
  setAcademicDateDone,
  type AcademicActionResult,
} from "./university-actions";

const WEEKDAYS_LONG = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

type Editing =
  | { kind: "subject"; item?: Subject }
  | { kind: "session"; item?: ClassSession }
  | { kind: "date"; item?: AcademicDate }
  | null;

const titles = {
  subject: ["Nueva asignatura", "Editar asignatura"],
  session: ["Nueva clase", "Editar clase"],
  date: ["Nuevo examen o entrega", "Editar examen o entrega"],
} as const;

/** Universidad (cliente): asignaturas, horario semanal y exámenes/entregas. */
export function UniversityBoard({
  subjects,
  sessions,
  dates,
  today,
}: {
  subjects: Subject[];
  sessions: ClassSession[];
  dates: AcademicDate[];
  today: string;
}) {
  const [editing, setEditing] = useState<Editing>(null);
  const [showDone, setShowDone] = useState(false);
  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const activeSubjects = subjects.filter((s) => s.active);
  const visibleDates = dates.filter((d) => (showDone ? true : !d.done && d.date >= today));
  const close = () => setEditing(null);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {/* ---- Asignaturas ---- */}
        <section className="glass rounded-2xl p-5">
          <Header title="Asignaturas" onAdd={() => setEditing({ kind: "subject" })} addLabel="Asignatura" />
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Añade tus asignaturas para empezar. Después podrás crear su horario y sus exámenes.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setEditing({ kind: "subject", item: s })}
                  className={cn("rounded-xl bg-white/[0.03] p-4 text-left transition-colors hover:bg-white/[0.06]", !s.active && "opacity-50")}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{s.name}</p>
                    {s.code && <Pill className="bg-primary/15 text-primary">{s.code}</Pill>}
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">{s.professor ?? (s.active ? " " : "Archivada")}</p>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progreso</span>
                    <span>{s.progress}%</span>
                  </div>
                  <ProgressBar value={s.progress} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ---- Horario ---- */}
        <section className="glass rounded-2xl p-5">
          <Header
            title="Horario semanal"
            onAdd={activeSubjects.length ? () => setEditing({ kind: "session" }) : undefined}
            addLabel="Clase"
          />
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {activeSubjects.length ? "Aún no hay clases en tu horario." : "Primero crea una asignatura."}
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {sessions.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => setEditing({ kind: "session", item: c })} className="flex w-full items-center gap-4 py-2.5 text-left text-sm hover:text-primary">
                    <span className="w-10 text-muted-foreground">{WEEKDAYS_SHORT[c.weekday]}</span>
                    <span className="w-24 tabular-nums text-muted-foreground">{c.start}–{c.end}</span>
                    <span className="flex-1 truncate">{subjectById.get(c.subjectId)?.name}</span>
                    <span className="text-xs text-muted-foreground">{c.room}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground/70">Las clases aparecen automáticamente en Hoy, Semana y Mes dentro del periodo de cada asignatura.</p>
        </section>
      </div>

      {/* ---- Exámenes y entregas ---- */}
      <section className="glass self-start rounded-2xl p-5">
        <Header title="Exámenes y entregas" onAdd={() => setEditing({ kind: "date" })} addLabel="Añadir" />
        {visibleDates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay exámenes ni entregas pendientes.</p>
        ) : (
          <ul className="space-y-2">
            {visibleDates.map((d) => (
              <DateItem key={d.id} date={d} today={today} subject={d.subjectId ? subjectById.get(d.subjectId) : undefined} onEdit={() => setEditing({ kind: "date", item: d })} />
            ))}
          </ul>
        )}
        <button type="button" onClick={() => setShowDone((v) => !v)} className="mt-3 text-xs text-muted-foreground hover:text-foreground">
          {showDone ? "Ocultar pasadas y completadas" : "Ver también pasadas y completadas"}
        </button>
      </section>

      <Modal open={editing !== null} onClose={close} title={editing ? titles[editing.kind][editing.item ? 1 : 0] : ""}>
        {editing?.kind === "subject" && <SubjectForm key={editing.item?.id ?? "new"} subject={editing.item} onDone={close} />}
        {editing?.kind === "session" && <SessionForm key={editing.item?.id ?? "new"} session={editing.item} subjects={activeSubjects} onDone={close} />}
        {editing?.kind === "date" && <DateForm key={editing.item?.id ?? "new"} date={editing.item} subjects={activeSubjects} today={today} onDone={close} />}
      </Modal>
    </div>
  );
}

function Header({ title, onAdd, addLabel }: { title: string; onAdd?: () => void; addLabel: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {onAdd && (
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

function DateItem({ date: d, today, subject, onEdit }: { date: AcademicDate; today: string; subject?: Subject; onEdit: () => void }) {
  const [, startTransition] = useTransition();
  const Icon = d.done ? CircleCheck : Circle;
  const days = daysBetween(today, d.date);

  return (
    <li className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3">
      <button
        type="button"
        aria-label={d.done ? "Marcar como pendiente" : "Marcar como hecho"}
        onClick={() => startTransition(async () => void (await setAcademicDateDone(d.id, !d.done)))}
        className="mt-0.5"
      >
        <Icon className={cn("size-4", d.done ? "text-primary" : "text-muted-foreground hover:text-foreground")} />
      </button>
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("truncate text-sm font-medium", d.done && "text-muted-foreground line-through")}>{d.title}</p>
          <Pill className={d.kind === "exam" ? "bg-rose-400/15 text-rose-300" : "bg-amber-400/15 text-amber-300"}>
            {d.kind === "exam" ? "Examen" : "Entrega"}
          </Pill>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {subject && `${subject.name} · `}
          <span className="capitalize">{relativeDayLabel(d.date, today)}</span>
          {" "}({formatDate(d.date, { day: "numeric", month: "short" })}{d.time && `, ${d.time}`})
          {days > 1 && ` · en ${days} días`}
        </p>
      </button>
    </li>
  );
}

/** Hook común: conecta un formulario con su Server Action y cierra al terminar bien. */
function useSave(action: (fd: FormData) => Promise<AcademicActionResult>, onDone: () => void) {
  return useActionState<AcademicActionResult, FormData>(async (_prev, fd) => {
    const res = await action(fd);
    if (res.ok) onDone();
    return res;
  }, { ok: true });
}

function ErrorText({ result }: { result: AcademicActionResult }) {
  return !result.ok && result.error ? <p role="alert" className="text-sm text-destructive">{result.error}</p> : null;
}

function SubjectForm({ subject, onDone }: { subject?: Subject; onDone: () => void }) {
  const [result, action, pending] = useSave((fd) => saveSubject(subject?.id ?? null, fd), onDone);
  const [progress, setProgress] = useState(subject?.progress ?? 0);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="s-name" className={labelClass}>Nombre</label>
          <input id="s-name" name="name" required maxLength={100} defaultValue={subject?.name} autoFocus className={fieldClass} />
        </div>
        <div>
          <label htmlFor="s-code" className={labelClass}>Siglas (opcional)</label>
          <input id="s-code" name="code" maxLength={20} defaultValue={subject?.code} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="s-prof" className={labelClass}>Profesor/a (opcional)</label>
          <input id="s-prof" name="professor" maxLength={100} defaultValue={subject?.professor} className={fieldClass} />
        </div>
        <div className="col-span-2">
          <label htmlFor="s-progress" className={labelClass}>Progreso: {progress}%</label>
          <input
            id="s-progress"
            name="progress"
            type="range"
            min={0}
            max={100}
            step={5}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
        </div>
        <div>
          <label htmlFor="s-start" className={labelClass}>Inicio del periodo</label>
          <DatePicker id="s-start" name="periodStart" defaultValue={subject?.periodStart} allowEmpty />
        </div>
        <div>
          <label htmlFor="s-end" className={labelClass}>Fin del periodo</label>
          <DatePicker id="s-end" name="periodEnd" defaultValue={subject?.periodEnd} allowEmpty />
        </div>
        <label className="col-span-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={subject?.active ?? true} className="size-4 accent-[var(--primary)]" />
          Asignatura activa (desmárcala al terminar el curso para archivarla)
        </label>
      </div>
      <ErrorText result={result} />
      <FormActions pending={pending} onCancel={onDone} onDone={onDone} onDelete={subject ? () => deleteSubject(subject.id) : undefined} />
      {subject && <p className="text-xs text-muted-foreground/70">Al eliminar una asignatura se eliminan también sus clases y exámenes.</p>}
    </form>
  );
}

function SessionForm({ session, subjects, onDone }: { session?: ClassSession; subjects: Subject[]; onDone: () => void }) {
  const [result, action, pending] = useSave((fd) => saveSession(session?.id ?? null, fd), onDone);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="c-subject" className={labelClass}>Asignatura</label>
          <select id="c-subject" name="subjectId" required defaultValue={session?.subjectId ?? subjects[0]?.id} className={fieldClass}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="c-day" className={labelClass}>Día</label>
          <select id="c-day" name="weekday" defaultValue={session?.weekday ?? 0} className={fieldClass}>
            {WEEKDAYS_LONG.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="c-room" className={labelClass}>Aula (opcional)</label>
          <input id="c-room" name="room" maxLength={50} defaultValue={session?.room} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="c-start" className={labelClass}>Empieza</label>
          <TimeField id="c-start" name="start" defaultValue={session?.start} />
        </div>
        <div>
          <label htmlFor="c-end" className={labelClass}>Termina</label>
          <TimeField id="c-end" name="end" defaultValue={session?.end} />
        </div>
      </div>
      <ErrorText result={result} />
      <FormActions pending={pending} onCancel={onDone} onDone={onDone} onDelete={session ? () => deleteSession(session.id) : undefined} />
    </form>
  );
}

function DateForm({ date, subjects, today, onDone }: { date?: AcademicDate; subjects: Subject[]; today: string; onDone: () => void }) {
  const [result, action, pending] = useSave((fd) => saveAcademicDate(date?.id ?? null, fd), onDone);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="d-title" className={labelClass}>Título</label>
          <input id="d-title" name="title" required maxLength={150} defaultValue={date?.title} autoFocus placeholder="Examen parcial, Práctica 3…" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="d-kind" className={labelClass}>Tipo</label>
          <select id="d-kind" name="kind" defaultValue={date?.kind ?? "exam"} className={fieldClass}>
            <option value="exam">Examen</option>
            <option value="deadline">Entrega</option>
          </select>
        </div>
        <div>
          <label htmlFor="d-subject" className={labelClass}>Asignatura</label>
          <select id="d-subject" name="subjectId" defaultValue={date?.subjectId ?? ""} className={fieldClass}>
            <option value="">Ninguna</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="d-date" className={labelClass}>Fecha</label>
          <DatePicker id="d-date" name="date" defaultValue={date?.date ?? today} />
        </div>
        <div>
          <label htmlFor="d-time" className={labelClass}>Hora (opcional)</label>
          <TimeField id="d-time" name="time" defaultValue={date?.time} />
        </div>
      </div>
      <ErrorText result={result} />
      <FormActions pending={pending} onCancel={onDone} onDone={onDone} onDelete={date ? () => deleteAcademicDate(date.id) : undefined} />
    </form>
  );
}
