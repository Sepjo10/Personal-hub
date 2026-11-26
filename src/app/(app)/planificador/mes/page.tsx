import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import { MonthView } from "@/features/planner/month-view";

export const metadata: Metadata = { title: "Mes" };

export default function MonthPage() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <MonthView />
    </Suspense>
  );
}
