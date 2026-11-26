import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import { WeekView } from "@/features/planner/week-view";

export const metadata: Metadata = { title: "Semana" };

export default function WeekPage() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <WeekView />
    </Suspense>
  );
}
