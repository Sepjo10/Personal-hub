export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  concept: string;
  amount: number; // siempre positivo; el tipo indica el signo
  category: string;
  date: string;
};
