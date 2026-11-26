import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import { TodayView } from "@/features/planner/today-view";

export const metadata: Metadata = { title: "Hoy" };

export default function TodayPage() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <TodayView />
    </Suspense>
  );
}
