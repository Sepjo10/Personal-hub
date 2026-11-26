import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ProgressBar } from "@/components/common/progress-bar";
import { formatDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { getToday } from "@/lib/today";
import { cn } from "@/lib/utils";
import { getMockMonthlyHistory, getMockTransactions } from "@/data/mock/finance";
import { BalanceChart, IncomeExpenseChart, SERIES } from "./finance-charts";

/** Finanzas: resumen del mes, gastos por categoría y movimientos. */
export async function FinanceView() {
  const today = await getToday();
  const month = today.slice(0, 7);
  const transactions = getMockTransactions(today)
    .filter((t) => t.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));

  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  // Agrupa los gastos por categoría: { Comida: 113.05, Vivienda: 280, ... }
  const byCategory = new Map<string, number>();
  for (const t of transactions.filter((t) => t.type === "expense")) {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  }
  const categories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const history = getMockMonthlyHistory(today, { income, expenses });

  return (
    <div className="space-y-4">
      <p className="text-sm capitalize text-muted-foreground">{formatDate(today, { month: "long", year: "numeric" })}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={<ArrowUpRight />} label="Ingresos" value={formatCurrency(income)} color={SERIES.income} />
        <Stat icon={<ArrowDownRight />} label="Gastos" value={formatCurrency(expenses)} color={SERIES.expenses} />
        <Stat icon={<Wallet />} label="Disponible" value={formatCurrency(balance)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Ingresos y gastos · últimos 6 meses">
          <IncomeExpenseChart data={history} />
        </Panel>
        <Panel title="Saldo mensual">
          <BalanceChart data={history} />
        </Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Gastos por categoría">
          <ul className="space-y-3">
            {categories.map(([category, amount]) => (
              <li key={category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{category}</span>
                  <span className="tabular-nums text-muted-foreground">{formatCurrency(amount)}</span>
                </div>
                <ProgressBar value={(amount / expenses) * 100} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Movimientos" className="lg:col-span-2">
          <ul className="divide-y divide-white/5">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="w-14 text-xs text-muted-foreground">{formatDate(t.date, { day: "numeric", month: "short" })}</span>
                <span className="min-w-0 flex-1 truncate">{t.concept}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">{t.category}</span>
                <span className={cn("w-24 text-right tabular-nums", t.type === "income" ? "text-foreground" : "text-muted-foreground")}>
                  {t.type === "income" ? "+" : "−"}
                  {formatCurrency(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-white/5 text-foreground [&_svg]:size-5" style={color ? { color } : undefined}>
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
