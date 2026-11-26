"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { MonthSummary } from "@/data/mock/finance";

/**
 * Gráficas de Finanzas dibujadas con SVG, sin librerías externas.
 * Son componentes de cliente porque reaccionan al ratón (tooltip al pasar por encima).
 *
 * Colores comprobados para daltonismo sobre fondo oscuro:
 * ingresos = violeta, gastos = ámbar (rojo/verde se confunden con deuteranopía).
 */
export const SERIES = { income: "#8b5cf6", expenses: "#d97706" };

const W = 600; // sistema de coordenadas interno; el SVG se escala al ancho disponible
const H = 220;
const PAD = { top: 12, right: 8, bottom: 24, left: 48 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

const monthLabel = (month: string) =>
  new Intl.DateTimeFormat("es-ES", { month: "short", timeZone: "UTC" }).format(new Date(`${month}-15T12:00:00Z`));

/** Redondea hacia arriba a un valor "bonito" para el eje (250, 500, 750...). */
const niceCeil = (v: number) => Math.max(250, Math.ceil(v / 250) * 250);

/** Rectángulo con solo las esquinas superiores redondeadas (anclado a la base). */
function barPath(x: number, y: number, w: number, h: number, r = 4) {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

function Legend() {
  return (
    <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm" style={{ background: SERIES.income }} /> Ingresos
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-sm" style={{ background: SERIES.expenses }} /> Gastos
      </span>
    </div>
  );
}

function Tooltip({ leftPct, children }: { leftPct: number; children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute top-0 z-10 min-w-36 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg"
      style={{ left: `${Math.min(85, Math.max(15, leftPct))}%` }}
    >
      {children}
    </div>
  );
}

function YAxis({ ticks, y }: { ticks: number[]; y: (v: number) => number }) {
  return (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={t === 0 ? 0.2 : 0.07} />
          <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px]">
            {t} €
          </text>
        </g>
      ))}
    </>
  );
}

/** Barras agrupadas: ingresos vs. gastos de los últimos meses. */
export function IncomeExpenseChart({ data }: { data: MonthSummary[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceCeil(Math.max(...data.flatMap((d) => [d.income, d.expenses])));
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const groupW = plotW / data.length;
  const barW = Math.min(20, groupW / 3);
  const gap = 2;

  return (
    <div className="relative">
      <Legend />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Ingresos y gastos por mes">
        <YAxis ticks={[0, max / 2, max]} y={y} />
        {data.map((d, i) => {
          const cx = PAD.left + groupW * i + groupW / 2;
          return (
            <g key={d.month} opacity={active === null || active === i ? 1 : 0.45}>
              <path d={barPath(cx - barW - gap / 2, y(d.income), barW, y(0) - y(d.income))} fill={SERIES.income} />
              <path d={barPath(cx + gap / 2, y(d.expenses), barW, y(0) - y(d.expenses))} fill={SERIES.expenses} />
              <text x={cx} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[11px] capitalize">
                {monthLabel(d.month)}
              </text>
              {/* Zona invisible más grande que las barras para facilitar el hover */}
              <rect
                x={cx - groupW / 2}
                y={PAD.top}
                width={groupW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
            </g>
          );
        })}
      </svg>
      {active !== null && (
        <Tooltip leftPct={((PAD.left + groupW * active + groupW / 2) / W) * 100}>
          <p className="mb-1 font-medium capitalize">{monthLabel(data[active].month)}</p>
          <Row color={SERIES.income} label="Ingresos" value={data[active].income} />
          <Row color={SERIES.expenses} label="Gastos" value={data[active].expenses} />
          <p className="mt-1 border-t border-border pt-1 text-muted-foreground">
            Saldo: <span className="text-foreground">{formatCurrency(data[active].income - data[active].expenses)}</span>
          </p>
        </Tooltip>
      )}
      <DataTable data={data} />
    </div>
  );
}

/** Línea: saldo (ingresos − gastos) de cada mes. */
export function BalanceChart({ data }: { data: MonthSummary[] }) {
  const [active, setActive] = useState<number | null>(null);
  const values = data.map((d) => d.income - d.expenses);
  const max = niceCeil(Math.max(...values, 0));
  const min = Math.min(0, -niceCeil(Math.abs(Math.min(...values, 0))) * (Math.min(...values) < 0 ? 1 : 0));
  const y = (v: number) => PAD.top + plotH - ((v - min) / (max - min)) * plotH;
  const step = plotW / data.length;
  const x = (i: number) => PAD.left + step * i + step / 2;
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join("");
  const ticks = min < 0 ? [min, 0, max] : [0, max / 2, max];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Saldo mensual">
        <YAxis ticks={ticks} y={y} />
        {active !== null && (
          <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} stroke="currentColor" strokeOpacity={0.2} />
        )}
        <path d={line} fill="none" stroke={SERIES.income} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {values.map((v, i) => (
          <circle key={data[i].month} cx={x(i)} cy={y(v)} r={active === i ? 5 : 4} fill={SERIES.income} stroke="var(--card)" strokeWidth={2} />
        ))}
        {data.map((d, i) => (
          <g key={d.month}>
            <text x={x(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[11px] capitalize">
              {monthLabel(d.month)}
            </text>
            <rect
              x={x(i) - step / 2}
              y={PAD.top}
              width={step}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            />
          </g>
        ))}
      </svg>
      {active !== null && (
        <Tooltip leftPct={(x(active) / W) * 100}>
          <p className="font-medium capitalize">{monthLabel(data[active].month)}</p>
          <p className="text-muted-foreground">
            Saldo: <span className="text-foreground">{formatCurrency(values[active])}</span>
          </p>
        </Tooltip>
      )}
    </div>
  );
}

function Row({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <p className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-sm" style={{ background: color }} />
        {label}
      </span>
      <span className="tabular-nums">{formatCurrency(value)}</span>
    </p>
  );
}

/** Tabla oculta visualmente pero legible por lectores de pantalla (accesibilidad). */
function DataTable({ data }: { data: MonthSummary[] }) {
  return (
    <table className="sr-only">
      <caption>Ingresos y gastos por mes</caption>
      <thead>
        <tr><th>Mes</th><th>Ingresos</th><th>Gastos</th></tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.month}><td>{monthLabel(d.month)}</td><td>{formatCurrency(d.income)}</td><td>{formatCurrency(d.expenses)}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
