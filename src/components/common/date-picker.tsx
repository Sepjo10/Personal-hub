"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
 * Con allowEmpty, la fecha es opcional: puede quedar vacía ("Sin fecha").
 *
 * El calendario usa position: fixed calculada a partir del botón, para que no
 * quede recortado dentro de una ventana modal con scroll. Si no cabe debajo,
 * se abre hacia arriba.
 */
const POPOVER_WIDTH = 288; // w-72
const POPOVER_HEIGHT = 340;
export function DatePicker({
  name,
  id,
  defaultValue,
  allowEmpty = false,
}: {
  name: string;
  id?: string;
  defaultValue?: string;
  allowEmpty?: boolean;
}) {
  const today = todayISO();
  const [value, setValue] = useState(defaultValue ?? (allowEmpty ? "" : today));
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState((value || today).slice(0, 8) + "01");
  const [position, setPosition] = useState<CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function openPopover() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow >= POPOVER_HEIGHT + 8 ? rect.bottom + 8 : Math.max(8, rect.top - POPOVER_HEIGHT - 8);
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - POPOVER_WIDTH - 8);
      setPosition({ top, left });
    }
    setViewMonth((value || today).slice(0, 8) + "01");
    setOpen(true);
  }

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
    // Si se hace scroll o cambia el tamaño, la posición ya no es válida: se cierra
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("scroll", close, true);
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
        ref={buttonRef}
        id={id}
        type="button"
        onClick={() => (open ? setOpen(false) : openPopover())}
        className={cn(fieldClass, "flex items-center justify-between text-left tabular-nums")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {value ? toSpanish(value) : <span className="text-muted-foreground">Sin fecha</span>}
        <CalendarDays className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <div style={position} className="fixed z-50 w-72 rounded-xl border border-border bg-popover p-3 shadow-2xl">
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
            {allowEmpty && value ? (
              <button type="button" onClick={() => select("")} className="text-muted-foreground hover:text-foreground">Quitar fecha</button>
            ) : (
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">Cerrar</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
