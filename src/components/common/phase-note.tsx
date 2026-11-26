/** Aviso discreto de que una función llegará en una fase posterior. */
export function PhaseNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-xs text-muted-foreground/70">{children}</p>;
}
