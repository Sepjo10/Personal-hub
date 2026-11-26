/** Esqueleto genérico mientras se carga una vista. */
export function ViewSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 lg:grid-cols-3">
      <div className="h-72 rounded-2xl bg-white/5 lg:col-span-2" />
      <div className="h-72 rounded-2xl bg-white/5" />
    </div>
  );
}
