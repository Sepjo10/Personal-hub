"use client";

import { useActionState, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/common/date-picker";
import { Modal, fieldClass, labelClass } from "@/components/common/modal";
import { formatDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Transaction, type TransactionType } from "@/types/finance";
import { deleteTransaction, saveTransaction, type FinanceActionResult } from "./actions";

type Editing = { mode: "new" } | { mode: "edit"; transaction: Transaction } | null;

/** Lista de movimientos del mes + modal para crear/editar (cliente). */
export function TransactionsPanel({ transactions, defaultDate }: { transactions: Transaction[]; defaultDate: string }) {
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <section className="glass rounded-2xl p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">Movimientos</h2>
        <Button size="sm" onClick={() => setEditing({ mode: "new" })}>
          <Plus />
          Nuevo movimiento
        </Button>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay movimientos este mes.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {transactions.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setEditing({ mode: "edit", transaction: t })}
                className="flex w-full items-center gap-3 rounded-lg py-2.5 text-left text-sm hover:bg-white/[0.03]"
              >
                <span className="w-14 text-xs text-muted-foreground">{formatDate(t.date, { day: "numeric", month: "short" })}</span>
                <span className="min-w-0 flex-1 truncate">{t.concept}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">{t.category}</span>
                <span className={cn("w-24 text-right tabular-nums", t.type === "income" ? "text-foreground" : "text-muted-foreground")}>
                  {t.type === "income" ? "+" : "−"}
                  {formatCurrency(t.amount)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.mode === "edit" ? "Editar movimiento" : "Nuevo movimiento"}>
        {editing && (
          <TransactionForm
            key={editing.mode === "edit" ? editing.transaction.id : "new"}
            transaction={editing.mode === "edit" ? editing.transaction : undefined}
            defaultDate={defaultDate}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </section>
  );
}

function TransactionForm({ transaction, defaultDate, onDone }: { transaction?: Transaction; defaultDate: string; onDone: () => void }) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [result, formAction, pending] = useActionState<FinanceActionResult, FormData>(async (_prev, formData) => {
    const res = await saveTransaction(transaction?.id ?? null, formData);
    if (res.ok) onDone();
    return res;
  }, { ok: true });

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form action={formAction} className="space-y-4">
      {/* Selector Gasto / Ingreso */}
      <input type="hidden" name="type" value={type} />
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "rounded-lg py-1.5 text-sm font-medium transition-colors",
              type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "expense" ? "Gasto" : "Ingreso"}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="tx-concept" className={labelClass}>Concepto</label>
        <input id="tx-concept" name="concept" required maxLength={120} defaultValue={transaction?.concept} autoFocus className={fieldClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tx-amount" className={labelClass}>Importe (€)</label>
          <input
            id="tx-amount"
            name="amount"
            required
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={transaction ? String(transaction.amount).replace(".", ",") : undefined}
            className={`${fieldClass} tabular-nums`}
          />
        </div>
        <div>
          <label htmlFor="tx-date" className={labelClass}>Fecha</label>
          <DatePicker id="tx-date" name="date" defaultValue={transaction?.date ?? defaultDate} />
        </div>
      </div>

      <div>
        <label htmlFor="tx-category" className={labelClass}>Categoría</label>
        <select id="tx-category" name="category" defaultValue={transaction?.category ?? categories[0]} key={type} className={fieldClass}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          {transaction && !categories.includes(transaction.category) && <option value={transaction.category}>{transaction.category}</option>}
        </select>
      </div>

      {!result.ok && result.error && <p role="alert" className="text-sm text-destructive">{result.error}</p>}

      <div className="flex items-center justify-between gap-2 pt-2">
        {transaction ? (
          confirmDelete ? (
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => startDelete(async () => { if ((await deleteTransaction(transaction.id)).ok) onDone(); })}
            >
              {deleting ? "Eliminando…" : "¿Seguro? Eliminar"}
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)} className="text-muted-foreground">Eliminar</Button>
          )
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
          <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</Button>
        </div>
      </div>
    </form>
  );
}
