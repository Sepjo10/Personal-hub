import { getCurrentUser } from "@/lib/auth";
import { addMonths } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { MonthSummary, Transaction, TransactionType } from "@/types/finance";

type TransactionRow = {
  id: string;
  type: TransactionType;
  concept: string;
  amount: number | string;
  category: string;
  date: string;
};

/**
 * Movimientos del mes indicado + resumen de los 6 últimos meses (para las gráficas).
 * Se hace UNA sola consulta (6 meses) y se agrega en JavaScript: para un uso
 * personal son pocos datos y evitamos varias idas y vueltas a la base de datos.
 */
export async function getFinanceData(monthStart: string): Promise<{ transactions: Transaction[]; history: MonthSummary[] }> {
  await getCurrentUser();
  const supabase = await createClient();

  const from = addMonths(monthStart, -5);
  const nextMonth = addMonths(monthStart, 1);

  const { data, error } = await supabase
    .from("transactions")
    .select("id, type, concept, amount, category, date")
    .gte("date", from)
    .lt("date", nextMonth)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`No se pudieron cargar los movimientos: ${error.message}`);

  const all: Transaction[] = (data as TransactionRow[]).map((r) => ({ ...r, amount: Number(r.amount) }));

  // Inicializa los 6 meses a 0 para que salgan aunque no tengan movimientos
  const history: MonthSummary[] = Array.from({ length: 6 }, (_, i) => ({
    month: addMonths(monthStart, i - 5).slice(0, 7),
    income: 0,
    expenses: 0,
  }));
  const byMonth = new Map(history.map((h) => [h.month, h]));
  for (const t of all) {
    const summary = byMonth.get(t.date.slice(0, 7));
    if (!summary) continue;
    if (t.type === "income") summary.income += t.amount;
    else summary.expenses += t.amount;
  }

  const month = monthStart.slice(0, 7);
  return { transactions: all.filter((t) => t.date.startsWith(month)), history };
}
