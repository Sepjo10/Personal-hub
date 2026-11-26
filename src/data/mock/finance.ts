import { addDays } from "@/lib/dates";
import type { Transaction } from "@/types/finance";

// DATOS FICTICIOS. Se sustituirán por Supabase en la Fase 5.
export function getMockTransactions(today: string): Transaction[] {
  const month = today.slice(0, 8); // "AAAA-MM-"
  return [
    { id: "f1", type: "income", concept: "Beca", amount: 450, category: "Becas", date: `${month}01` },
    { id: "f2", type: "income", concept: "Clases particulares", amount: 120, category: "Trabajo", date: `${month}05` },
    { id: "f3", type: "expense", concept: "Alquiler", amount: 280, category: "Vivienda", date: `${month}02` },
    { id: "f4", type: "expense", concept: "Supermercado", amount: 64.3, category: "Comida", date: `${month}08` },
    { id: "f5", type: "expense", concept: "Abono transporte", amount: 20, category: "Transporte", date: `${month}03` },
    { id: "f6", type: "expense", concept: "Cine", amount: 9.5, category: "Ocio", date: `${month}12` },
    { id: "f7", type: "expense", concept: "Supermercado", amount: 48.75, category: "Comida", date: `${month}15` },
    { id: "f8", type: "expense", concept: "Gimnasio", amount: 25, category: "Salud", date: addDays(today, 0) },
  ];
}

export type MonthSummary = { month: string; income: number; expenses: number };

/**
 * Historial ficticio de los 5 meses anteriores + el mes actual (calculado a partir
 * de los movimientos). En la Fase 5 se calculará con una consulta agregada en Supabase.
 */
export function getMockMonthlyHistory(today: string, current: { income: number; expenses: number }): MonthSummary[] {
  const past = [
    { income: 570, expenses: 432 },
    { income: 450, expenses: 498 },
    { income: 690, expenses: 455 },
    { income: 450, expenses: 410 },
    { income: 610, expenses: 520 },
  ];
  const [y, m] = today.split("-").map(Number);
  const monthKey = (offset: number) => {
    const d = new Date(Date.UTC(y, m - 1 - offset, 1));
    return d.toISOString().slice(0, 7);
  };
  return [...past.map((p, i) => ({ month: monthKey(5 - i), ...p })), { month: monthKey(0), ...current }];
}
