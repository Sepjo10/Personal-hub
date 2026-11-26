import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import { MonthView } from "@/features/planner/month-view";
import type { SearchParams } from "@/features/planner/search-params";

export const metadata: Metadata = { title: "Mes" };

// searchParams (?fecha=...) es una promesa: se pasa sin esperar a la vista,
// que la resuelve dentro de <Suspense> porque depende de la petición.
export default function MonthPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <MonthView searchParams={searchParams} />
    </Suspense>
  );
}
