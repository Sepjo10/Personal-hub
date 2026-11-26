import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import { ActivitiesView } from "@/features/leisure/activities-view";

export const metadata: Metadata = { title: "Actividades" };

export default function ActivitiesPage() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <ActivitiesView />
    </Suspense>
  );
}
