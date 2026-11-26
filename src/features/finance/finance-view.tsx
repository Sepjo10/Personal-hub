import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Panel } from "@/components/common/panel";
import { ProgressBar } from "@/components/common/progress-bar";
import { addMonths, formatDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { getToday } from "@/lib/today";
import { cn } from "@/lib/utils";
import { DateNav } from "@/features/planner/date-nav";
import { getBaseDate, type SearchParams } from "@/features/planner/search-params";
import { SERIES } from "./chart-colors";
import { getFinanceData } from "./data";
import { BalanceChart, IncomeExpenseChart } from "./finance-charts";
import { TransactionsPanel } from "./transactions-panel";

const PATH = "/finanzas";

/** Finanzas: resumen del mes, gráficas, gastos por categoría y movimientos. Navegable con ?fecha=. */
export async function FinanceView({ searchParams }: { searchParams: SearchParams }) {
  const today = await getToday();
  const base = await getBaseDate(searchParams, today);
  const monthStart = `${base.slice(0, 8)}01`;
  const isCurrentMonth = monthStart.slice(0, 7) === today.slice(0, 7);

  const { transactions, history } = await getFinanceData(monthStart);

  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  // Agrupa los gastos por categoría: { Comida: 113.05, Vivienda: 280, ... }
  const byCategory = new Map<string, number>();
  for (const t of transactions.filter((t) => t.type === "expense")) {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  }
  const categories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      <DateNav
        label={formatDate(monthStart, { month: "long", year: "numeric" })}
        prevHref={`${PATH}?fecha=${addMonths(monthStart, -1)}`}
        nextHref={`${PATH}?fecha=${addMonths(monthStart, 1)}`}
        todayHref={isCurrentMonth ? undefined : PATH}
      />
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
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin gastos este mes.</p>
          ) : (
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
          )}
        </Panel>
        <TransactionsPanel transactions={transactions} defaultDate={isCurrentMonth ? today : monthStart} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-5">
      <span
        className={cn("grid size-10 place-items-center rounded-xl bg-white/5 text-foreground [&_svg]:size-5")}
        style={color ? { color } : undefined}
      >
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
