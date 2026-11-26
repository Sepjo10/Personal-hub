/** Tarjeta provisional que indica qué contendrá una vista. Se sustituirá en los siguientes pasos. */
export function ComingSoon({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Vista en construcción. Contendrá:</p>
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-foreground/80">
            <span className="size-1.5 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
