"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, formatDate, monthGridDays, todayISO, WEEKDAYS_SHORT } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { fieldClass } from "./modal";

/** "2026-11-26" -> "26/11/2026" */
const toSpanish = (iso: string) => iso.split("-").reverse().join("/");

/**
 * Selector de fecha propio: formato dd/mm/aaaa y semanas que empiezan en lunes,
 * independientemente del idioma del navegador (el <input type="date"> nativo
 * usa el formato del navegador y no se puede cambiar).
 * Envía el valor en un <input type="hidden"> con formato AAAA-MM-DD, así que
 * funciona dentro de cualquier formulario igual que un campo normal.
 */
export function DatePicker({ name, id, defaultValue }: { name: string; id?: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? todayISO());
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(value.slice(0, 8) + "01");
  const ref = useRef<HTMLDivElement>(null);
  const today = todayISO();

  // Cerrar al hacer clic fuera o pulsar Esc
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation(); // que Esc cierre el calendario y no el modal entero
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  function select(iso: string) {
    setValue(iso);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        onClick={() => {
          setViewMonth(value.slice(0, 8) + "01");
          setOpen((o) => !o);
        }}
        className={cn(fieldClass, "flex items-center justify-between text-left tabular-nums")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {toSpanish(value)}
        <CalendarDays className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-72 rounded-xl border border-border bg-popover p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => setViewMonth(addMonths(viewMonth, -1))} aria-label="Mes anterior" className="rounded-lg p-1.5 hover:bg-white/5">
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium capitalize">{formatDate(viewMonth, { month: "long", year: "numeric" })}</span>
            <button type="button" onClick={() => setViewMonth(addMonths(viewMonth, 1))} aria-label="Mes siguiente" className="rounded-lg p-1.5 hover:bg-white/5">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground">
            {WEEKDAYS_SHORT.map((d) => (
              <span key={d} className="py-1">{d.slice(0, 2)}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {monthGridDays(viewMonth).map((day) => {
              const selected = day === value;
              const inMonth = day.startsWith(viewMonth.slice(0, 7));
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => select(day)}
                  className={cn(
                    "grid h-8 place-items-center rounded-lg text-sm tabular-nums transition-colors",
                    selected ? "bg-primary text-primary-foreground" : "hover:bg-white/10",
                    !inMonth && !selected && "text-muted-foreground/40",
                    day === today && !selected && "ring-1 ring-primary/60",
                  )}
                >
                  {Number(day.slice(8))}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between border-t border-white/5 pt-2 text-xs">
            <button type="button" onClick={() => select(today)} className="text-primary hover:underline">Hoy</button>
            <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
