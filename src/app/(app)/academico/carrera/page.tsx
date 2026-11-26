import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewSkeleton } from "@/components/common/view-skeleton";
import { CareerView } from "@/features/academic/career-view";

export const metadata: Metadata = { title: "Carrera" };

export default function CareerPage() {
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <CareerView />
    </Suspense>
  );
}
