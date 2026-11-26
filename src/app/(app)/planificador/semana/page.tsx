import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import { WeekView } from "@/features/planner/week-view";
import type { SearchParams } from "@/features/planner/search-params";

export const metadata: Metadata = { title: "Semana" };

// searchParams (?fecha=...) es una promesa: se pasa sin esperar a la vista,
// que la resuelve dentro de <Suspense> porque depende de la petición.
export default function WeekPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <WeekView searchParams={searchParams} />
    </Suspense>
  );
}
