export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  concept: string;
  amount: number; // siempre positivo; el tipo indica el signo
  category: string;
  date: string;
};

/** Totales de un mes, para las gráficas. month = "AAAA-MM". */
export type MonthSummary = { month: string; income: number; expenses: number };

export const EXPENSE_CATEGORIES = ["Comida", "Vivienda", "Transporte", "Ocio", "Salud", "Estudios", "Ropa", "Suscripciones", "Otros"];
export const INCOME_CATEGORIES = ["Becas", "Trabajo", "Familia", "Ventas", "Otros"];
